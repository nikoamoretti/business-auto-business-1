import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.config import settings
from app.models.user import User

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/billing", tags=["billing"])

PLAN_PRICE_MAP = {
    "pro": "price_pro_monthly",
    "enterprise": "price_enterprise_monthly",
}


@router.post("/checkout")
async def create_checkout_session(
    plan: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if plan not in PLAN_PRICE_MAP:
        raise HTTPException(status_code=400, detail=f"Unknown plan: {plan}")

    clerk_id = current_user["sub"]
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create or get Stripe customer
    if not user.stripe_customer_id:
        customer = stripe.Customer.create(email=user.email, metadata={"clerk_id": clerk_id})
        user.stripe_customer_id = customer.id
        await db.flush()

    session = stripe.checkout.Session.create(
        customer=user.stripe_customer_id,
        mode="subscription",
        payment_method_types=["card"],
        line_items=[{"price": PLAN_PRICE_MAP[plan], "quantity": 1}],
        success_url="http://localhost:3000/billing?success=1",
        cancel_url="http://localhost:3000/billing?canceled=1",
        metadata={"user_id": str(user.id), "plan": plan},
    )
    return {"url": session.url}


@router.post("/portal")
async def customer_portal(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    clerk_id = current_user["sub"]
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user or not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No Stripe customer found")

    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url="http://localhost:3000/billing",
    )
    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = int(session["metadata"]["user_id"])
        plan = session["metadata"]["plan"]
        sub_id = session.get("subscription")

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.plan = plan
            user.plan_active = True
            user.stripe_subscription_id = sub_id
            await db.flush()

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        result = await db.execute(
            select(User).where(User.stripe_subscription_id == sub["id"])
        )
        user = result.scalar_one_or_none()
        if user:
            user.plan = "starter"
            user.plan_active = True
            user.stripe_subscription_id = None
            await db.flush()

    return {"received": True}
