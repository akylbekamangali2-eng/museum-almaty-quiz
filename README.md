# Сайт «Музей Алматы» + квиз + QR + Supabase

Файлы: index.html, style.css, app.js, supabase.sql, папка img/.

1. Supabase: создать проект -> SQL Editor -> вставить supabase.sql -> Run.
2. Project Settings -> API: скопировать Project URL и anon public key в начало app.js.
3. Открыть index.html локально для проверки (без ключей сайт работает, но результаты не сохраняются).
4. Опубликовать: app.netlify.com/drop, перетащить всю папку (с img/). Появится ссылка.
5. Открыть ссылку: QR внизу страницы ведёт на неё. Сделать скриншот QR для последнего слайда.
6. Проверить с телефона, затем удалить тестовые записи в Table Editor -> quiz_results.

Не вставляйте service_role ключ в app.js, только anon public key.
