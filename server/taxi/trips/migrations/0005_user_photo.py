# Generated by Django 3.0.4 on 2020-10-12 12:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0004_trip_status_cancelled'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to='photos'),
        ),
    ]
