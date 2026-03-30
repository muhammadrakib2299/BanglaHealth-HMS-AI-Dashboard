from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import require_roles
from models.audit_log import AuditLog
from models.user import Role, User

router = APIRouter(prefix="/api/audit-log", tags=["Audit Log"])


@router.get("/")
def get_audit_log(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    action: str | None = Query(None),
    resource_type: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    query = db.query(AuditLog)

    if action:
        query = query.filter(AuditLog.action == action)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)

    total = query.count()
    logs = (
        query.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "details": log.details,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }
