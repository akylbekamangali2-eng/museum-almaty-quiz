// ============ НАСТРОЙКИ (вставьте свои значения из Supabase) ============
// Project Settings -> API: Project URL и anon public key
const SUPABASE_URL = 'https://yscnrcjesdlsmsesvutb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzY25yY2plc2Rsc21zZXN2dXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MzE3NzgsImV4cCI6MjEwNzMwNzc3OH0.rp2Ew7o2lKRNaVGyYmEJVxOTai7bamsuTn_Gfl_tkgs';
// Адрес сайта для QR. Оставьте пустым, чтобы взять адрес текущей страницы.
const SITE_URL = '';

// ============ ВОПРОСЫ ============
const questions = [
  {
    q: 'В каком году построено историческое здание Музея Алматы?',
    a: ['1802', '1892', '2002', '2016'],
    correct: 1,
    why: 'Здание построено в 1892 году. Музей открылся в 2002-м, а новая экспозиция появилась в 2016-м.'
  },
  {
    q: 'Кто автор «Зафар-наме», где есть одно из ранних упоминаний Алматы?',
    a: ['Олжас Сулейменов', 'Павел Гурдэ', 'Шараф ад-Дин Али Йазди', 'Абай Кунанбаев'],
    correct: 2,
    why: 'Автор сочинения (1424–1425) — Шараф ад-Дин Али Йазди, XV век.'
  },
  {
    q: 'Что находилось в здании музея раньше?',
    a: ['Верненский детский приют', 'Городская библиотека', 'Телеграф', 'Гимназия'],
    correct: 0,
    why: 'Раньше в здании располагался Верненский детский приют.'
  },
  {
    q: 'Сколько залов в Музее Алматы?',
    a: ['3', '7', '11', '16'],
    correct: 2,
    why: 'В музее 11 залов и 39 267 экспонатов.'
  },
  {
    q: 'Кто архитектор исторического здания музея?',
    a: ['Павел Гурдэ', 'Андрей Зенков', 'Шараф ад-Дин Али Йазди', 'Олжас Сулейменов'],
    correct: 0,
    why: 'Архитектор здания — Павел Гурдэ.'
  }
];

// ============ ИНИЦИАЛИЗАЦИЯ ============
const $ = id => document.getElementById(id);
const configured = !SUPABASE_URL.includes('ВАШ') && !SUPABASE_KEY.includes('ВАШ');
const sb = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
let current = 0, score = 0, playerName = '', locked = false;

// QR-код
try {
  new QRCode($('qrcode'), {
    text: SITE_URL || location.href.split('#')[0],
    width: 168, height: 168, correctLevel: QRCode.CorrectLevel.M
  });
} catch (e) { console.error('QR error', e); }

// ============ КВИЗ ============
$('startBtn').onclick = () => {
  playerName = $('name').value.trim().slice(0, 40) || 'Аноним';
  current = 0; score = 0;
  $('start').hidden = true;
  $('result').hidden = true;
  $('question').hidden = false;
  showQuestion();
};

function showQuestion() {
  const item = questions[current];
  locked = false;
  $('counter').textContent = `Вопрос ${current + 1} из ${questions.length}`;
  $('bar').style.width = (current / questions.length * 100) + '%';
  $('qText').textContent = item.q;
  $('explain').hidden = true;
  $('nextBtn').hidden = true;
  $('answers').innerHTML = '';
  item.a.forEach((text, i) => {
    const b = document.createElement('button');
    b.className = 'answer';
    b.textContent = text;
    b.onclick = () => choose(i);
    $('answers').appendChild(b);
  });
}

function choose(i) {
  if (locked) return;
  locked = true;
  const item = questions[current];
  const btns = [...document.querySelectorAll('.answer')];
  btns.forEach(b => (b.disabled = true));
  if (i === item.correct) { score++; btns[i].classList.add('correct'); }
  else { btns[i].classList.add('wrong'); btns[item.correct].classList.add('correct'); }
  $('explain').textContent = item.why;
  $('explain').hidden = false;
  $('nextBtn').textContent = current === questions.length - 1 ? 'Показать результат' : 'Дальше';
  $('nextBtn').hidden = false;
}

$('nextBtn').onclick = () => {
  current++;
  current < questions.length ? showQuestion() : finish();
};

async function finish() {
  $('bar').style.width = '100%';
  $('question').hidden = true;
  $('result').hidden = false;
  $('score').textContent = `${playerName}, ваш результат: ${score} из ${questions.length}`;
  $('leaders').innerHTML = '';

  if (!sb) {
    $('saveStatus').textContent = 'Supabase не настроен: результат не сохранён (см. README).';
    return;
  }
  $('saveStatus').textContent = 'Сохраняем результат…';
  const { error } = await sb.from('quiz_results').insert({ name: playerName, score });
  $('saveStatus').textContent = error ? 'Не удалось сохранить результат.' : 'Результат сохранён.';
  if (error) console.error(error.message);
  loadLeaders();
}

async function loadLeaders() {
  const list = $('leaders');
  const { data, error } = await sb.from('quiz_results')
    .select('name, score')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10);
  if (error || !data) { list.innerHTML = '<li>Не удалось загрузить таблицу</li>'; return; }
  data.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.name} — ${r.score}/${questions.length}`; // textContent защищает от XSS
    list.appendChild(li);
  });
}

$('again').onclick = () => { $('result').hidden = true; $('start').hidden = false; };
$('name').addEventListener('keydown', e => { if (e.key === 'Enter') $('startBtn').click(); });

// ============ ПЛАВНОЕ ПОЯВЛЕНИЕ БЛОКОВ ============
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08 })
  : null;
document.querySelectorAll('[data-r]').forEach(el => io ? io.observe(el) : el.classList.add('in'));
