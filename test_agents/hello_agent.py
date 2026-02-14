from uagents import Agent, Context

# 1. Initialize your agent
# The 'seed' ensures you keep the same address every time you run the script
alice = Agent(name="alice", seed="your_secret_recovery_phrase")

# 2. Define a "Startup" behavior
@alice.on_event("startup")
async def introduce(ctx: Context):
    ctx.logger.info(f"Hello! My agent address is: {alice.address}")

# 3. Define a periodic task (Interval)
@alice.on_interval(period=2.0)
async def say_hello(ctx: Context):
    ctx.logger.info("Hello world! I am an autonomous agent.")

if __name__ == "__main__":
    alice.run()