const symbols = {
  dog: { label: '강아지', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/dog.png' },
  cat: { label: '고양이', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/cat.png' },
  bird: { label: '새', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/bird.png' },
  fish: { label: '물고기', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/twemoji/1f41f.svg' },
  horse: { label: '말', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/horse.png' },
  cup: { label: '컵', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/noun-project/Cup-35dae4d6c2.svg' },
  chair: { label: '의자', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/mulberry/chair.svg' },
  spoon: { label: '숟가락', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/spoon.png' },
  toothbrush: { label: '칫솔', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/toothbrush.png' },
  shoes: { label: '신발', src: 'https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/sports%20shoes.png' }
};

const questions = [
  { category: '동물', target: 'dog', choices: ['dog', 'cat', 'bird', 'fish'] },
  { category: '동물', target: 'cat', choices: ['cat', 'horse', 'fish', 'bird'] },
  { category: '동물', target: 'bird', choices: ['bird', 'dog', 'horse', 'cat'] },
  { category: '동물', target: 'fish', choices: ['fish', 'cat', 'bird', 'horse'] },
  { category: '동물', target: 'horse', choices: ['horse', 'dog', 'fish', 'cat'] },
  { category: '일상용품', target: 'cup', choices: ['cup', 'chair', 'spoon', 'toothbrush'] },
  { category: '일상용품', target: 'chair', choices: ['chair', 'shoes', 'cup', 'spoon'] },
  { category: '일상용품', target: 'spoon', choices: ['spoon', 'toothbrush', 'chair', 'cup'] },
  { category: '일상용품', target: 'toothbrush', choices: ['toothbrush', 'shoes', 'spoon', 'chair'] },
  { category: '일상용품', target: 'shoes', choices: ['shoes', 'cup', 'toothbrush', 'chair'] }
];

let currentIndex = 0;
let results = [];
let questionStart = 0;
let participantId = '';

const $ = (id) => document.getElementById(id);
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const formatSeconds = (ms) => `${(ms / 1000).toFixed(1)}초`;
const objectParticle = (word) => {
  const code = word.charCodeAt(word.length - 1) - 0xAC00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? '을' : '를';
};

function renderQuestion() {
  const question = questions[currentIndex];
  const target = symbols[question.target];
  $('category-tag').textContent = question.category;
  $('question-number').textContent = `문항 ${currentIndex + 1}`;
  $('target-word').textContent = target.label;
  $('assessor-word').textContent = `${target.label}${objectParticle(target.label)} 찾아보세요.`;
  $('feedback').textContent = '';
  $('feedback').className = 'feedback';
  const choiceArea = $('choices');
  choiceArea.replaceChildren();

  shuffle(question.choices).forEach((key) => {
    const item = symbols[key];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-button';
    button.dataset.key = key;
    button.setAttribute('aria-label', item.label);
    const image = document.createElement('img');
    image.src = item.src;
    image.alt = item.label;
    const label = document.createElement('span');
    label.textContent = item.label;
    button.append(image, label);
    button.addEventListener('click', () => selectAnswer(key));
    choiceArea.append(button);
  });
  questionStart = performance.now();
  updateLiveDashboard();
}

function selectAnswer(selectedKey) {
  const question = questions[currentIndex];
  const reactionMs = Math.round(performance.now() - questionStart);
  const isCorrect = selectedKey === question.target;
  const buttons = [...document.querySelectorAll('.choice-button')];
  buttons.forEach((button) => {
    button.disabled = true;
    if (button.dataset.key === question.target) button.classList.add('correct');
    if (button.dataset.key === selectedKey && !isCorrect) button.classList.add('incorrect');
  });

  results.push({
    item: currentIndex + 1,
    category: question.category,
    target: symbols[question.target].label,
    selected: symbols[selectedKey].label,
    correct: isCorrect,
    reactionMs,
    answeredAt: new Date().toISOString()
  });
  $('feedback').textContent = isCorrect ? '정답입니다.' : `정답은 “${symbols[question.target].label}”입니다.`;
  $('feedback').classList.add(isCorrect ? 'correct' : 'incorrect');
  updateLiveDashboard();

  window.setTimeout(() => {
    currentIndex += 1;
    if (currentIndex < questions.length) renderQuestion();
    else showResults();
  }, 700);
}

function updateLiveDashboard() {
  const animal = results.filter((result) => result.category === '동물');
  const object = results.filter((result) => result.category === '일상용품');
  const correct = results.filter((result) => result.correct);
  $('live-total').textContent = correct.length;
  $('live-animal').textContent = animal.filter((result) => result.correct).length;
  $('live-object').textContent = object.filter((result) => result.correct).length;
  $('progress-text').textContent = `${Math.min(currentIndex + 1, 10)} / 10`;
  $('progress-bar').style.width = `${Math.max(10, (currentIndex / 10) * 100)}%`;
}

function showResults() {
  $('test-screen').classList.add('hidden');
  $('result-screen').classList.remove('hidden');
  const animal = results.filter((result) => result.category === '동물');
  const object = results.filter((result) => result.category === '일상용품');
  const totalCorrect = results.filter((result) => result.correct).length;
  $('result-participant').textContent = participantId ? `아동 식별자: ${participantId}` : '아동 식별자를 입력하지 않았습니다.';
  $('final-total').textContent = `${totalCorrect} / 10`;
  $('accuracy-text').textContent = `정답률 ${Math.round((totalCorrect / 10) * 100)}%`;
  $('final-animal').textContent = `${animal.filter((r) => r.correct).length} / 5`;
  $('final-object').textContent = `${object.filter((r) => r.correct).length} / 5`;
  $('animal-time').textContent = `평균 반응시간 ${formatSeconds(average(animal.map((r) => r.reactionMs)))}`;
  $('object-time').textContent = `평균 반응시간 ${formatSeconds(average(object.map((r) => r.reactionMs)))}`;
  $('final-time').textContent = formatSeconds(average(results.map((r) => r.reactionMs)));

  const body = $('result-body');
  body.replaceChildren();
  results.forEach((result) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${result.item}</td><td>${result.category}</td><td>${result.target}</td><td>${result.selected}</td><td class="${result.correct ? 'status-correct' : 'status-incorrect'}">${result.correct ? '정답' : '오답'}</td><td>${formatSeconds(result.reactionMs)}</td>`;
    body.append(row);
  });
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function exportCsv() {
  const header = ['아동 식별자', '검사 일시(ISO)', '문항', '범주', '목표 낱말', '선택', '정오', '반응 시간(ms)', '반응 시간(초)'];
  const rows = results.map((result) => [
    participantId || '', result.answeredAt, result.item, result.category, result.target, result.selected,
    result.correct ? '정답' : '오답', result.reactionMs, (result.reactionMs / 1000).toFixed(3)
  ]);
  const csv = '\uFEFF' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeId = (participantId || 'anonymous').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
  link.href = url;
  link.download = `그림어휘력검사_${safeId}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetTest() {
  currentIndex = 0;
  results = [];
  $('participant').value = '';
  $('result-screen').classList.add('hidden');
  $('start-screen').classList.remove('hidden');
}

$('start-form').addEventListener('submit', (event) => {
  event.preventDefault();
  participantId = $('participant').value.trim();
  $('start-screen').classList.add('hidden');
  $('test-screen').classList.remove('hidden');
  renderQuestion();
});
$('export-csv').addEventListener('click', exportCsv);
$('restart').addEventListener('click', resetTest);
