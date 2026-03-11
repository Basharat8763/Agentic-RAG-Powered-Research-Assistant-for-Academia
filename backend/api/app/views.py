from django.shortcuts import render
from django.http.response import JsonResponse
from .models import *
import base64
from .main_part import *

    
def signUp(request):
   if request.method == "GET":
        try:
            name=request.GET.get("name","")
            email=request.GET.get("email","")
            uni=request.GET.get("uni","")
            field=request.GET.get("field","")
            passw=request.GET.get("pass","")
            if User.objects.filter(email=email).exists():
                return JsonResponse({'message':'Try with another email'})
            User(name=name,email=email,uni=uni,field=field,passw=passw).save()
            return JsonResponse({'message':"Success"})
        except  Exception as e:
            return JsonResponse({"message": f"{e}"})

def login(re):
    if re.method == "GET":
        mail=re.GET.get('mail','')
        passw=re.GET.get('pass','')
        user=User.objects.filter(email=mail,passw=passw)
        if user.exists():
            return JsonResponse({'message':base64.b64encode(str(user.last().id).encode()).decode()})
    return JsonResponse({'message':'Invalid User'})

def search(re):
    if re.method=="GET":
        search=re.GET.get('search','')
        result=re.GET.get('result',0)
        fromd=str(re.GET.get('from','12-2-2025'))
        to=str(re.GET.get('to','12-2-2026'))
        try:
            from_date = datetime.strptime(fromd,"%d-%m-%Y")
            to_date = datetime.strptime(to,"%d-%m-%Y")
        except  Exception :
            from_date = datetime.strptime(fromd,"%Y-%m-%d")
            to_date = datetime.strptime(to,"%Y-%m-%d")
            
        from_arix= from_date.strftime("%Y%m%d") + "0000"
        to_arix= to_date.strftime("%Y%m%d") + "0000"
        sort = re.GET.get('sort','')
  
        
        data={'datat':searchData(search,result=int(result),start=from_arix,end=to_arix,sort_type=sort)}
        initOf()
        return JsonResponse(data)

def question(re):
    if re.method == "GET":
        ques=re.GET.get('question','')
        try:
            answer=askQuestion(ques)
            return JsonResponse({'answer':answer})
        except Exception as e:
            print(e,"Error Line")
            return JsonResponse({'answer':'Sorry Server is not Reachable'})
def profile(re):
    if re.method == "GET":
        id=re.GET.get('id','')
        id=int(base64.b64decode(id).decode())
        data=User.objects.filter(id=id).last().__dict__
        del data['_state']
        return JsonResponse(data)