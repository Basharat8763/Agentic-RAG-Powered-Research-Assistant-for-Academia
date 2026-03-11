from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('profile/',name="profile",view=profile),
    path('question/',name="question",view=question),
    path('search/',name="search",view=search),
    path('signup/',name="signup",view=signUp),
    path('login/',name="login",view=login),
]
