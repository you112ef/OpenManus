# OpenManus Web Interface

واجهة ويب متقدمة لـ OpenManus، مصممة للعمل مع Cloudflare Pages مع backend حقيقي.

## 🚀 الميزات

- **واجهة حديثة**: مبنية بـ Tailwind CSS مع تصميم متجاوب
- **دعم اللغة العربية**: واجهة كاملة باللغة العربية مع اتجاه RTL
- **نظام محادثة تفاعلي**: مع مؤشرات الكتابة والرسائل
- **Backend حقيقي**: FastAPI backend يتصل بـ OpenManus الفعلي
- **تصميم متجاوب**: يعمل على جميع الأجهزة
- **أمان محسن**: رؤوس أمان وبيانات محمية
- **أداء محسن**: قواعد تخزين مؤقت وتحسينات

## 📁 هيكل الملفات

```
web/
├── index.html          # الواجهة الرئيسية
├── script.js           # وظائف JavaScript
├── app.py              # FastAPI backend
├── requirements.txt    # تبعيات Python
├── Dockerfile          # تكوين Docker
├── docker-compose.yml  # تكوين Docker Compose
├── _headers            # رؤوس Cloudflare Pages
├── _redirects          # إعادة التوجيه
└── package.json        # تكوين المشروع
```

## 🛠️ التثبيت والتشغيل

### المتطلبات الأساسية

- Python 3.12+
- Node.js 16+
- Docker (اختياري)

### التطوير المحلي

1. **تشغيل Backend:**
   ```bash
   cd web
   pip install -r requirements.txt
   python app.py
   ```

2. **تشغيل Frontend:**
   ```bash
   npm run dev
   ```

3. **تشغيل Backend مع إعادة التحميل:**
   ```bash
   npm run backend:dev
   ```

### استخدام Docker

```bash
# بناء وتشغيل
npm run docker:compose

# إيقاف
npm run docker:compose:down
```

## 🌐 النشر على Cloudflare Pages

### الطريقة الأولى: النشر اليدوي

1. اذهب إلى [dash.cloudflare.com](https://dash.cloudflare.com)
2. اختر "Pages" → "Create a project"
3. اربط بـ GitHub repository
4. اضبط:
   - **Build output directory**: `web`
   - **Framework preset**: `None`
   - **Build command**: اتركه فارغاً

### الطريقة الثانية: النشر التلقائي

1. أضف هذه الأسرار إلى GitHub:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. ادفع إلى الفرع الرئيسي - سيتم النشر تلقائياً

## 🔧 التخصيص

### تغيير الألوان
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}
```

### إضافة ميزات جديدة
```javascript
// في script.js
class OpenManusChat {
  // أضف طرق جديدة هنا
}
```

### تغيير النصوص
```html
<!-- في index.html -->
<h1>العنوان الجديد</h1>
```

## 🔌 ربط Backend

لربط الواجهة بـ OpenManus backend:

1. **تحديث URL في JavaScript:**
   ```javascript
   getApiBaseUrl() {
     return 'https://your-backend-url.com';
   }
   ```

2. **إعداد CORS في Backend:**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-domain.pages.dev"]
   )
   ```

## 📱 دعم المتصفحات

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🧪 الاختبار

```bash
# اختبار Backend
npm run test

# فحص الكود
npm run lint

# تنسيق الكود
npm run format
```

## 🚀 النشر

### Cloudflare Pages
```bash
# النشر التلقائي عند الدفع
git push origin main
```

### Docker
```bash
# بناء الصورة
npm run docker:build

# تشغيل الحاوية
npm run docker:run
```

## 📊 المراقبة

- **صحة API**: `/api/health`
- **معلومات النظام**: `/api/info`
- **سجلات الخادم**: تحقق من console

## 🔒 الأمان

- رؤوس أمان محسنة
- حماية من XSS
- سياسة أمان المحتوى
- HTTPS إجباري

## 🆘 الدعم

- **GitHub Issues**: [OpenManus Issues](https://github.com/FoundationAgents/OpenManus/issues)
- **Discord**: [OpenManus Community](https://discord.gg/DYn29wFk9z)
- **التوثيق**: [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)

## 📄 الترخيص

MIT License - انظر ملف LICENSE الرئيسي للمشروع.

---

**ملاحظة**: هذه واجهة ويب ثابتة. للحصول على وظائف OpenManus الكاملة، تحتاج إلى نشر Python backend منفصل (مثل Cloudflare Workers أو Heroku) وتحديث JavaScript لاستدعاء نقاط النهاية الفعلية.