# Generated by Django 3.0.4 on 2020-10-12 00:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0003_trip_driver_rider'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trip',
            name='status',
            field=models.CharField(choices=[('REQUESTED', 'REQUESTED'), ('STARTED', 'STARTED'), ('IN_PROGRESS', 'IN_PROGRESS'), ('COMPLETED', 'COMPLETED'), ('CANCELLED', 'CANCELLED')], default='REQUESTED', max_length=20),
        ),
    ]
