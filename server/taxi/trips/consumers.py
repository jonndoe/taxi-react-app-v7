from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from trips.serializers import NestedTripSerializer, TripSerializer
from trips.models import Trip


class TaxiConsumer(AsyncJsonWebsocketConsumer):
    # any client connected will be auto subscribed to the 'test' group
    groups = ['test']

    @database_sync_to_async
    def _create_trip(self, data):
        serializer = TripSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.create(serializer.validated_data)

    # here we get trip as input and serialize all its data
    # to JSON to send it over websockets to our client
    @database_sync_to_async
    def _get_trip_data(self, trip):
      return NestedTripSerializer(trip).data


    @database_sync_to_async
    def _get_user_group(self, user):
        return user.groups.first().name

    @database_sync_to_async
    def _get_trip_ids(self, user):
        user_groups = user.groups.values_list('name', flat=True)
        if 'driver' in user_groups:
            trip_ids = user.trips_as_driver.exclude(
                status=[Trip.COMPLETED, Trip.CANCELLED],
            ).only('id').values_list('id', flat=True)
        else:
            trip_ids = user.trips_as_rider.exclude(
                status=[Trip.COMPLETED, Trip.CANCELLED],
            ).only('id').values_list('id', flat=True)
        return map(str, trip_ids)

    @database_sync_to_async
    def _update_trip(self, data):
        instance = Trip.objects.get(id=data.get('id'))
        serializer = TripSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.update(instance, serializer.validated_data)


    async def connect(self):
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
        else:
            user_group = await self._get_user_group(user)
            if user_group == 'driver':
                # subscribe to a 'drivers' group as well
                await self.channel_layer.group_add(
                    group='drivers',
                    channel=self.channel_name,
                )

            # Create GROUPS for ALL trips(which is not yet completed) of user(rider or driver).
            # This needed why? Because when user disconnects, all trip groups discarded.
            # When user re-connects to server over websocket,
            # All trip groups to be available. But why to discard groups
            # upon disconnection???
            for trip_id in await self._get_trip_ids(user):
                await self.channel_layer.group_add(
                    group=trip_id,
                    channel=self.channel_name,
                )

            await self.accept()

    async def create_trip(self, message):
        data = message.get('data')
        trip = await self._create_trip(data)
        trip_data = await self._get_trip_data(trip)

        # Send rider request to all drivers.
        # i.e. we send a message to drivers pool(drivers group) on 'test_channel' (mailbox)
        # when message sent to a group, it sended to ALL channels in that group.
        await self.channel_layer.group_send(group='drivers', message={
            'type': 'echo.message',
            'data': trip_data
        })

        # Add rider to trip group.
        await self.channel_layer.group_add(
            group=f'{trip.id}',
            channel=self.channel_name,
        )

        # Send echo.message with New created Trip_data
        # to the user, who requested the trip ONLY.
        await self.send_json({
          'type': 'echo.message',
          'data': trip_data,
        })

    # The relevant Trip record gets updated (to include the driver)
    async def update_trip(self, message):
        data = message.get('data')
        trip = await self._update_trip(data)
        trip_id = f'{trip.id}'
        trip_data = await self._get_trip_data(trip)

        # Send update to rider.
        # Actually it sends update to EVERYONE added to trip group.
        await self.channel_layer.group_send(
            group=trip_id,
            message={
                'type': 'echo.message',
                'data': trip_data,
            }
        )

        # Send message to all drivers, that trip was accepted.
        # TODO  driver who accepted trip should NOT receive this message.
        await self.channel_layer.group_send(
            group='drivers',
            message={
                'type': 'echo.message',
                'data': f'trip {trip_id} was accepted.',
            }
        )


        # Add driver to the trip group, because driver accepted the trip.
        await self.channel_layer.group_add(
            group=trip_id,
            channel=self.channel_name
        )

        # send message to driver who updated trip.
        await self.send_json({
            'type': 'echo.message',
            'data': trip_data
        })

    # The relevant Trip record gets cancelled (by rider)
    async def cancel_trip(self, message):
        data = message.get('data')
        trip = await self._update_trip(data)
        trip_id = f'{trip.id}'
        trip_data = await self._get_trip_data(trip)

        # Send update to rider and driver.
        # Actually it sends update to EVERYONE added to trip group.
        await self.channel_layer.group_send(
            group=trip_id,
            message={
                'type': 'echo.message',
                'data': trip_data,
            }
        )

        # Delete driver from the trip group, because rider cancelled the trip.
        #await self.channel_layer.group_discard(
        #    group=trip_id,
        #    channel=self.channel_name
        #)

        # Send echo message back to rider.
        await self.send_json({
            'type': 'echo.message',
            'data': trip_data
        })


    async def disconnect(self, code):
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
        else:
            user_group = await self._get_user_group(user)
            if user_group == 'driver':
                await self.channel_layer.group_discard(
                    group='drivers',
                    channel=self.channel_name,
                )
            # Discard trip groups upon disconnection.
            for trip_id in await self._get_trip_ids(user):
                await self.channel_layer.group_discard(
                    group=trip_id,
                    channel=self.channel_name,
                )
        await super().disconnect(code)

    async def echo_message(self, message):
        # This message will be send back to client only
        # since we use access token per user to connect to server over websockets.
        await self.send_json(message)

    # this function processes all messages that come to
    # the server
    async def receive_json(self, content, **kwargs):
        message_type = content.get('type')
        if message_type == 'create.trip':
            await self.create_trip(content)
        elif message_type == 'echo.message':
            await self.echo_message(content)
        elif message_type == 'update.trip':
            await self.update_trip(content)
        elif message_type == 'cancel.trip':
            await self.cancel_trip(content)


