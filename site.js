const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
const compactNavigation = window.matchMedia('(max-width: 57rem)');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.hidden = compactNavigation.matches && !open;
}

function syncNavigation() {
  menuButton.hidden = !compactNavigation.matches;
  setMenu(false);
}

syncNavigation();
compactNavigation.addEventListener('change', syncNavigation);
menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') === 'false');
});
navigation.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (link && compactNavigation.matches) {
    setMenu(false);
    if (!link.getAttribute('href').startsWith('#')) return;
    const section = document.querySelector(link.hash);
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  }
});
document.querySelector('.header').addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});

const filters = document.querySelector('.publication-filters');
const query = filters.querySelector('#paper-query');
const topic = filters.querySelector('#paper-topic');
const type = filters.querySelector('#paper-type');
const year = filters.querySelector('#paper-year');
const filterStatus = document.querySelector('#filter-status');
const toolbar = document.querySelector('.publication-toolbar');
const previousPapers = document.querySelector('#previous-papers');
const nextPapers = document.querySelector('#next-papers');
const pageSize = 6;
let publicationPage = 0;
let matchingPapers = [];

function normalizeSearch(value) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
}

const papers = Array.from(document.querySelectorAll('.paper'), (paper) => ({
  paper,
  searchText: normalizeSearch(paper.querySelector('.paper-citation').textContent),
  topics: paper.dataset.topics.split(' '),
}));

function renderPublications() {
  const start = publicationPage * pageSize;
  const end = Math.min(start + pageSize, matchingPapers.length);
  const visible = new Set(matchingPapers.slice(start, end));
  for (const { paper } of papers) {
    paper.hidden = !visible.has(paper);
  }
  previousPapers.disabled = publicationPage === 0;
  nextPapers.disabled = end >= matchingPapers.length;
  filterStatus.textContent = matchingPapers.length
    ? `Showing ${start + 1}–${end} of ${matchingPapers.length} matching publications`
    : 'No publications match. Try a different search or clear the filters.';
}

function filterPublications() {
  const terms = normalizeSearch(query.value).trim().split(/\s+/).filter(Boolean);
  const selectedTopic = topic.value;
  const selectedType = type.value;
  const selectedYear = year.value;
  matchingPapers = papers.filter(({ paper, searchText, topics }) => (
    (!selectedTopic || topics.includes(selectedTopic))
      && (!selectedType || paper.dataset.type === selectedType)
      && (!selectedYear || paper.dataset.year === selectedYear)
      && terms.every((term) => searchText.includes(term))
  )).map(({ paper }) => paper);
  publicationPage = 0;
  renderPublications();
}

function showLinkedPaper() {
  const index = papers.findIndex(({ paper }) => '#' + paper.id === window.location.hash);
  if (index === -1) return;
  filters.reset();
  requestAnimationFrame(() => {
    publicationPage = Math.floor(index / pageSize);
    renderPublications();
    papers[index].paper.scrollIntoView();
  });
}

filters.addEventListener('input', filterPublications);
filters.addEventListener('submit', (event) => event.preventDefault());
filters.addEventListener('reset', () => requestAnimationFrame(filterPublications));
previousPapers.addEventListener('click', () => {
  publicationPage -= 1;
  renderPublications();
  if (previousPapers.disabled) nextPapers.focus();
});
nextPapers.addEventListener('click', () => {
  publicationPage += 1;
  renderPublications();
  if (nextPapers.disabled) previousPapers.focus();
});
filterPublications();
toolbar.hidden = false;
filters.hidden = false;
window.addEventListener('hashchange', showLinkedPaper);
showLinkedPaper();
