"""
Health check endpoints.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime

from ...models.schemas import HealthResponse, ModelInfoResponse
from ...models.ml_models import get_model
from ...core.exceptions import ModelNotFoundError

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Basic health check endpoint to verify service status.

    Returns:
        HealthResponse: Service health status with model information
    """
    try:
        model = get_model()
        health_result = model.health_check()
        
        return HealthResponse(
            status=health_result["status"],
            message=health_result["message"],
            timestamp=datetime.now(),
            test_prediction=health_result.get("test_prediction")
        )
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            message=f"Health check failed: {str(e)}",
            timestamp=datetime.now(),
            test_prediction=None
        )


@router.get("/model", response_model=ModelInfoResponse)
async def model_info():
    """
    Get information about the current prediction model.

    Returns:
        ModelInfoResponse: Model metadata including version and capabilities
    """
    try:
        model = get_model()
        info = model.get_model_info()

        return ModelInfoResponse(
            model_version=info["model_version"],
            created_at=info["created_at"],
            feature_columns=info["feature_columns"],
            supported_property_types=info["supported_property_types"],
            is_loaded=info["is_loaded"],
            max_batch_size=info["max_batch_size"]
        )

    except ModelNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "error": f"Model not available: {str(e)}",
                "status": "error",
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": f"Failed to get model information: {str(e)}",
                "status": "error",
                "timestamp": datetime.now().isoformat()
            }
        )

