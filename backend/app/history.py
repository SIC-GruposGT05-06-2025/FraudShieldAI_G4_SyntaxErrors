"""
History management module for storing and retrieving fraud detection predictions
"""
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

class HistoryManager:
    """Manages prediction history persistence"""
    
    def __init__(self, filepath: str = "data/history.json"):
        """Initialize history manager
        
        Args:
            filepath: Path to JSON file where history will be stored
        """
        self.filepath = filepath
        self._ensure_directory()
        self._ensure_file()
    
    def _ensure_directory(self) -> None:
        """Ensure the directory exists"""
        directory = os.path.dirname(self.filepath)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
    
    def _ensure_file(self) -> None:
        """Ensure the history file exists"""
        if not os.path.exists(self.filepath):
            with open(self.filepath, 'w') as f:
                json.dump({"predictions": []}, f, indent=2)
    
    def _load_history(self) -> Dict[str, Any]:
        """Load history from JSON file"""
        try:
            with open(self.filepath, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {"predictions": []}
    
    def _save_history(self, data: Dict[str, Any]) -> None:
        """Save history to JSON file"""
        with open(self.filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    def add_prediction(self, prediction: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new prediction to history
        
        Args:
            prediction: The prediction response to save
            
        Returns:
            The saved prediction with metadata
        """
        history = self._load_history()
        
        # Add metadata
        prediction_entry = {
            **prediction,
            "saved_at": datetime.now().isoformat(),
            "sequence_number": len(history["predictions"]) + 1
        }
        
        history["predictions"].append(prediction_entry)
        self._save_history(history)
        
        return prediction_entry
    
    def get_all_predictions(self) -> List[Dict[str, Any]]:
        """Get all predictions sorted by timestamp (newest first)
        
        Returns:
            List of all predictions
        """
        history = self._load_history()
        predictions = history.get("predictions", [])
        # Sort by timestamp descending (newest first)
        return sorted(predictions, key=lambda x: x.get("timestamp", ""), reverse=True)
    
    def get_predictions_paginated(
        self, 
        page: int = 1, 
        items_per_page: int = 20,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Get paginated predictions with optional filtering
        
        Args:
            page: Page number (1-indexed)
            items_per_page: Number of items per page
            filters: Optional filters (risk_level, is_fraud, date_from, date_to)
            
        Returns:
            Dictionary with paginated predictions and metadata
        """
        predictions = self.get_all_predictions()
        
        # Apply filters if provided
        if filters:
            predictions = self._apply_filters(predictions, filters)
        
        # Calculate pagination
        total_items = len(predictions)
        total_pages = (total_items + items_per_page - 1) // items_per_page
        
        # Validate page number
        page = max(1, min(page, max(1, total_pages)))
        
        start_idx = (page - 1) * items_per_page
        end_idx = start_idx + items_per_page
        
        paginated_predictions = predictions[start_idx:end_idx]
        
        return {
            "data": paginated_predictions,
            "page": page,
            "items_per_page": items_per_page,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        }
    
    def _apply_filters(
        self, 
        predictions: List[Dict[str, Any]], 
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Apply filters to predictions list
        
        Args:
            predictions: List of predictions to filter
            filters: Filter criteria
            
        Returns:
            Filtered list of predictions
        """
        filtered = predictions
        
        # Filter by risk level
        if "risk_level" in filters and filters["risk_level"]:
            filtered = [p for p in filtered if p.get("risk_level") == filters["risk_level"]]
        
        # Filter by fraud status
        if "is_fraud" in filters and filters["is_fraud"] is not None:
            filtered = [p for p in filtered if p.get("is_fraud") == filters["is_fraud"]]
        
        # Filter by date range
        if "date_from" in filters and filters["date_from"]:
            filtered = [
                p for p in filtered 
                if p.get("timestamp", "") >= filters["date_from"]
            ]
        
        if "date_to" in filters and filters["date_to"]:
            filtered = [
                p for p in filtered 
                if p.get("timestamp", "") <= filters["date_to"]
            ]
        
        return filtered
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about all predictions
        
        Returns:
            Dictionary with various statistics
        """
        predictions = self.get_all_predictions()
        
        if not predictions:
            return {
                "total_predictions": 0,
                "total_fraud_detected": 0,
                "fraud_rate": 0.0,
                "average_risk_score": 0.0,
                "risk_distribution": {
                    "LOW": 0,
                    "MEDIUM": 0,
                    "HIGH": 0,
                    "CRITICAL": 0
                }
            }
        
        total = len(predictions)
        fraud_count = sum(1 for p in predictions if p.get("is_fraud"))
        fraud_rate = fraud_count / total if total > 0 else 0
        avg_risk = sum(p.get("risk_score", 0) for p in predictions) / total if total > 0 else 0
        
        risk_distribution = {
            "LOW": sum(1 for p in predictions if p.get("risk_level") == "LOW"),
            "MEDIUM": sum(1 for p in predictions if p.get("risk_level") == "MEDIUM"),
            "HIGH": sum(1 for p in predictions if p.get("risk_level") == "HIGH"),
            "CRITICAL": sum(1 for p in predictions if p.get("risk_level") == "CRITICAL"),
        }
        
        return {
            "total_predictions": total,
            "total_fraud_detected": fraud_count,
            "fraud_rate": round(fraud_rate, 4),
            "average_risk_score": round(avg_risk, 2),
            "risk_distribution": risk_distribution
        }
    
    def clear_history(self) -> None:
        """Clear all history"""
        self._save_history({"predictions": []})

# Global instance
_history_manager: Optional[HistoryManager] = None

def get_history_manager() -> HistoryManager:
    """Get or create the global history manager instance"""
    global _history_manager
    if _history_manager is None:
        _history_manager = HistoryManager()
    return _history_manager
