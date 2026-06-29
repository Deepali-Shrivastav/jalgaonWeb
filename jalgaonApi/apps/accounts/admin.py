from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    ordering = ['phone_number']
    list_display = ('phone_number', 'first_name', 'last_name', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'profile_pic')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password1', 'password2', 'first_name', 'last_name', 'profile_pic'),
        }),
    )
    filter_horizontal = ('groups', 'user_permissions')

admin.site.register(User, CustomUserAdmin)
