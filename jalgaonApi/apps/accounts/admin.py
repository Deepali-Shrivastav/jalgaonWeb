from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, LoginAttempt

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    ordering = ['-date_joined']
    list_display = (
        'phone_number', 'first_name', 'last_name', 'email',
        'role', 'is_verified', 'is_active', 'is_staff', 'date_joined'
    )
    list_filter = ('role', 'is_verified', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('phone_number', 'first_name', 'last_name', 'email')
    readonly_fields = ('date_joined', 'last_login')

    fieldsets = (
        ('Credentials', {'fields': ('phone_number', 'password')}),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email', 'profile_pic', 'bio', 'date_of_birth')
        }),
        ('Role & Verification', {
            'fields': ('role', 'is_verified'),
            'description': 'Set the user role and phone verification status.',
        }),
        ('System Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'phone_number', 'password1', 'password2',
                'first_name', 'last_name', 'email', 'role'
            ),
        }),
    )

    filter_horizontal = ('groups', 'user_permissions')


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    """Read-only admin view for monitoring login attempts."""
    list_display = ('phone_number', 'ip_address', 'was_successful', 'attempted_at', 'user_agent_short')
    list_filter = ('was_successful', 'attempted_at')
    search_fields = ('phone_number', 'ip_address')
    readonly_fields = ('phone_number', 'ip_address', 'user_agent', 'attempted_at', 'was_successful')
    ordering = ['-attempted_at']

    def user_agent_short(self, obj):
        return obj.user_agent[:60] + '…' if len(obj.user_agent) > 60 else obj.user_agent
    user_agent_short.short_description = 'User Agent'

    def has_add_permission(self, request):
        return False  # Login attempts should never be manually added

    def has_change_permission(self, request, obj=None):
        return False  # Login attempts are immutable audit records

    def has_delete_permission(self, request, obj=None):
        return request.user.role == 'super_admin'  # Only Super Admin can delete
