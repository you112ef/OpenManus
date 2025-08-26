# دليل نشر OpenManus على Cloudflare Pages

هذا الدليل سيساعدك في نشر واجهة OpenManus على Cloudflare Pages مع backend حقيقي.

## 📋 المتطلبات الأساسية

1. **حساب Cloudflare**: تحتاج إلى حساب Cloudflare (المستوى المجاني كافٍ)
2. **مستودع GitHub**: مشروع OpenManus يجب أن يكون على GitHub
3. **نطاق (اختياري)**: يمكنك استخدام نطاق مخصص أو النطاق الفرعي `.pages.dev` الافتراضي

## 🚀 خطوات النشر

### الطريقة الأولى: النشر عبر لوحة تحكم Cloudflare (موصى بها)

1. **تسجيل الدخول إلى Cloudflare Dashboard**
   - اذهب إلى [dash.cloudflare.com](https://dash.cloudflare.com)
   - سجل دخولك إلى حسابك

2. **الانتقال إلى Pages**
   - انقر على "Pages" في الشريط الجانبي الأيسر
   - انقر على "Create a project"

3. **ربط بـ Git**
   - اختر "Connect to Git"
   - حدد حساب GitHub واذن Cloudflare
   - حدد مستودع `FoundationAgents/OpenManus`

4. **تكوين إعدادات البناء**
   - **اسم المشروع**: `openmanus` (أو الاسم الذي تفضله)
   - **الفرع الإنتاجي**: `main` (أو الفرع الافتراضي)
   - **إطار العمل**: `None`
   - **أمر البناء**: اتركه فارغاً (غير مطلوب للموقع الثابت)
   - **مجلد الإخراج**: `web`
   - **المجلد الجذر**: اتركه فارغاً (إذا كان مجلد web في الجذر)

5. **المتغيرات البيئية** (اختياري)
   - أضف أي متغيرات بيئية إذا لزم الأمر
   - في الوقت الحالي، يمكنك تركها فارغة

6. **النشر**
   - انقر على "Save and Deploy"
   - انتظر حتى يكتمل البناء

### الطريقة الثانية: النشر عبر Wrangler CLI

1. **تثبيت Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **تسجيل الدخول إلى Cloudflare**
   ```bash
   wrangler login
   ```

3. **الانتقال إلى مجلد web**
   ```bash
   cd web
   ```

4. **النشر على Pages**
   ```bash
   wrangler pages deploy . --project-name=openmanus
   ```

### الطريقة الثالثة: النشر عبر GitHub Actions

1. **إنشاء GitHub Actions Workflow**
   أنشئ `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to Cloudflare Pages
   
   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Deploy to Cloudflare Pages
           uses: cloudflare/pages-action@v1
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             projectName: openmanus
             directory: web
             gitHubToken: ${{ secrets.GITHUB_TOKEN }}
   ```

2. **إضافة الأسرار إلى GitHub**
   - اذهب إلى إعدادات المستودع → Secrets and variables → Actions
   - أضف `CLOUDFLARE_API_TOKEN` و `CLOUDFLARE_ACCOUNT_ID`

## 🔧 ملفات التكوين

مجلد web يحتوي على عدة ملفات تكوين:

- **`_headers`**: رؤوس الأمان وقواعد التخزين المؤقت
- **`_redirects`**: إعادة توجيه URLs وقواعد التوجيه
- **`package.json`**: بيانات المشروع والنصوص البرمجية

## 🌐 إعداد النطاق المخصص

1. **إضافة نطاق مخصص**
   - في Cloudflare Pages dashboard، اذهب إلى مشروعك
   - انقر على "Custom domains"
   - أضف نطاقك

2. **تكوين DNS**
   - Cloudflare سيقوم بتكوين سجلات DNS تلقائياً
   - إذا كنت تستخدم DNS خارجي، أضف سجل CNAME يشير إلى URL `.pages.dev` الخاص بك

## 📊 ما بعد النشر

### التحقق من النشر
- تأكد من أن موقعك يعمل بشكل صحيح
- اختبر وظيفة المحادثة
- تأكد من تحميل جميع الأصول بشكل صحيح

### مراقبة الأداء
- استخدم Cloudflare Analytics لمراقبة حركة المرور
- تحقق من PageSpeed Insights لمقاييس الأداء

### تحديث المحتوى
- ادفع التغييرات إلى الفرع الرئيسي
- Cloudflare Pages سيعيد النشر تلقائياً

## 🔌 ربط Backend

للتطبيق الكامل، تحتاج إلى نشر Python backend:

### خيار 1: Cloudflare Workers (Python)
```bash
# نشر backend على Workers
wrangler deploy
```

### خيار 2: Heroku
```bash
# نشر على Heroku
heroku create openmanus-backend
git push heroku main
```

### خيار 3: Railway
```bash
# نشر على Railway
railway up
```

## 🛠️ استكشاف الأخطاء

### المشاكل الشائعة

1. **فشل البناء**
   - تحقق من سجلات البناء في Cloudflare dashboard
   - تأكد من مسارات الملفات والهيكل
   - تأكد من وجود جميع الملفات المطلوبة في مجلد `web`

2. **عدم تحميل الأصول**
   - تحقق من ملف `_headers` لقواعد التخزين المؤقت الصحيحة
   - تأكد من مسارات الملفات في HTML/CSS/JS
   - تحقق من console المتصفح للأخطاء

3. **مشاكل التوجيه**
   - تحقق من ملف `_redirects`
   - تأكد من أن التوجيه من جانب العميل يعمل
   - اختبر الوصول المباشر للـ URLs

### الدعم

- **توثيق Cloudflare Pages**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **مشاكل GitHub**: [github.com/FoundationAgents/OpenManus/issues](https://github.com/FoundationAgents/OpenManus/issues)
- **مجتمع Discord**: [discord.gg/DYn29wFk9z](https://discord.gg/DYn29wFk9z)

## 🚀 الخطوات التالية

بعد النشر الناجح:

1. **ربط Backend**: اربط الواجهة بـ OpenManus backend API
2. **إضافة المصادقة**: نفذ مصادقة المستخدم إذا لزم الأمر
3. **تخصيص الواجهة**: عدل الألوان والتخطيط والعلامة التجارية
4. **إضافة الميزات**: نفذ وظائف إضافية مثل رفع الملفات، اختيار الأدوات، إلخ

## 🔒 اعتبارات الأمان

- ملف `_headers` يتضمن رؤوس أمان
- سياسة أمان المحتوى مُكوّنة
- HTTPS مفروض من Cloudflare
- يُنصح بالتحديثات الأمنية المنتظمة

## 📱 اختبار التطبيق

### اختبار محلي
```bash
cd web
python app.py  # Backend
npm run dev    # Frontend
```

### اختبار Docker
```bash
cd web
npm run docker:compose
```

### اختبار النشر
1. ادفع التغييرات إلى GitHub
2. انتظر اكتمال النشر
3. اختبر الموقع المنشور

---

**ملاحظة مهمة**: هذه واجهة ويب ثابتة. للحصول على وظائف OpenManus الكاملة، تحتاج إلى نشر Python backend منفصل وتحديث JavaScript لاستدعاء نقاط النهاية الفعلية.

## 🎯 نصائح للنشر الناجح

1. **اختبر محلياً أولاً**: تأكد من أن كل شيء يعمل قبل النشر
2. **تحقق من الملفات**: تأكد من وجود جميع الملفات في مجلد `web`
3. **راجع السجلات**: تحقق من سجلات البناء للأخطاء
4. **اختبر بعد النشر**: تأكد من أن الموقع يعمل كما هو متوقع
5. **راقب الأداء**: استخدم أدوات المراقبة لتحسين الأداء