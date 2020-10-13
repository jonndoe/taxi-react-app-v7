from django.urls import path # new
from channels.routing import ProtocolTypeRouter, URLRouter # changed

from taxi.middleware import TokenAuthMiddlewareStack
from trips.consumers import TaxiConsumer


application = ProtocolTypeRouter({
    # we wrap URLRouter in our custom TokenAuthMiddlewareStack, so
    # all incoming connection requests will go through authentication method
    'websocket': TokenAuthMiddlewareStack(
        URLRouter([
            path('taxi/', TaxiConsumer),
        ]),
    ),
})