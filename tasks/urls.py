from django.urls import path
from django.views.generic import RedirectView
from . import views

urlpatterns = [
    # Frontend
    path('', views.FrontendAppView.as_view(), name='home'),
    
    # API Endpoints
    path('analyze/', views.analyze_tasks, name='analyze_tasks'),
    path('suggest/', views.suggest_tasks, name='suggest_tasks'),
    
    # Redirect all other paths to index.html to handle client-side routing
    path('<path:path>', views.FrontendAppView.as_view(), name='catch_all'),
]
