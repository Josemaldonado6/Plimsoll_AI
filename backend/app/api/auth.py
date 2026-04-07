# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: auth.py
# -----------------------------------------------------------------------------
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.db.database import get_db
from app.db.models import User
from app.api.security import create_access_token, verify_password, get_password_hash, get_current_user

router = APIRouter(prefix="/auth", tags=["Identity Protocol"])

@router.post("/login")
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    # Industrial Identity Verification (Asynchronous)
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    # [GOD-SEED] Automatic CPO account creation if not exists
    if form_data.username == "jose@plimsoll.ai" and not user:
        user = User(
            email="jose@plimsoll.ai",
            hashed_password=get_password_hash("Plimsoll2026!"), # Tactical Default
            full_name="José Maldonado (CPO)",
            tier="Sovereign",
            is_active=1
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid maritime credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account deactivated by Port Authority")

    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()

    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "tier": user.tier
        }
    }

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "full_name": current_user.full_name,
        "tier": current_user.tier,
        "is_active": current_user.is_active
    }
