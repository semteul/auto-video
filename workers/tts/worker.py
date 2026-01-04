import os

import dramatiq
from dramatiq.brokers.redis import RedisBroker
from dramatiq.results import Results
from dramatiq.results.backends.redis import RedisBackend


# Redis 브로커 설정 (로컬 도커 redis 사용)
redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", "6379"))

broker = RedisBroker(host=redis_host, port=redis_port)
result_backend = Results(backend=RedisBackend())

dramatiq.set_broker(broker)
dramatiq.set_result_backend(result_backend)


@dramatiq.actor(store_results=True)
def generate_tts_hello(name: str = "World"):
    """일단은 개쩌는 Hello World JSON만 반환하는 TTS 더미 태스크."""
    message = f"Hello {name}"
    return {"message": message}
