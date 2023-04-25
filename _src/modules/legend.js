import $ from 'jquery';

function showModal() {
  const $modalNode = $('#modal-legend');
  $modalNode.css('display', 'flex');
  $modalNode.focus();
}

function hideModal() {
  const $modalNode = $('#modal-legend');
  $modalNode.hide();
}

$('body').on('click', '#button-show-legend', showModal);
$('body').on('click', '.legend__modal-close', hideModal);
$('body').on('blur', '#modal-legend', hideModal);
