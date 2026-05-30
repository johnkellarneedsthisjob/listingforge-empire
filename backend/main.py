import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from openai import AsyncOpenAI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="ListingForge API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
ai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class WaitlistEntry(BaseModel):
    email: str


class GenerateRequest(BaseModel):
    product_type: str
    key_features: str


@app.get("/")
def root():
    return {"status": "ListingForge API is live"}


@app.post("/api/waitlist")
@limiter.limit("5/minute")
async def join_waitlist(request: Request, entry: WaitlistEntry):
    try:
        supabase.table("waitlist").insert({"email": entry.email}).execute()
        return {"status": "success", "message": "Email secured."}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Email acquisition failed. Might be a duplicate.")


@app.post("/api/generate")
@limiter.limit("10/minute")
async def generate_listing(request: Request, req_data: GenerateRequest):
    try:
        supabase.table("usage_logs").insert({"product_type": req_data.product_type}).execute()

        system_msg = (
            "You are an elite, highly converting e-commerce copywriter. "
            "Your specialty is Print-on-Demand and custom apparel, but you excel at all products. "
            "Output MUST be strict JSON with three keys: 'title' (catchy, SEO optimized), "
            "'description' (persuasive, bullet points for features), and 'tags' (comma separated, exact match keywords)."
        )
        user_msg = f"Product Type: {req_data.product_type}\nFeatures: {req_data.key_features}"

        completion = await ai_client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ]
        )
        return {"status": "success", "data": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
