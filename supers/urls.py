"""supers URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf.urls import url, include
from gm import views
from tastypie.api import Api
from gm.api import CharacterResource, NewsResource, StageResource, MissionResource, TeamResource

v1_api = Api(api_name='v1')
v1_api.register(CharacterResource())
v1_api.register(MissionResource())
v1_api.register(NewsResource())
v1_api.register(StageResource())
v1_api.register(TeamResource())

urlpatterns = [
    url(r'^character/(?P<slug>[\w-]+)/$', views.character),
    url(r'^map/', views.map),
    url(r'^admin/', admin.site.urls),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^api/', include(v1_api.urls)),
]
