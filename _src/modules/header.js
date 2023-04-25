import $ from 'jquery';

const headerSelector = $('#header-selector');
const openClass = 'selector-control_open';

headerSelector.on('click', () => {
  headerSelector.toggleClass(openClass);
});

$(document).on('click', (e) => {
  const isOpen = headerSelector.hasClass(openClass);
  const isClickOutside = !headerSelector.is(e.target) && headerSelector.has(e.target).length === 0;
  
  if (isOpen && isClickOutside) {
    headerSelector.toggleClass(openClass);
  }
});