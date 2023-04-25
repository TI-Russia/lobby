import $ from 'jquery';

const EVENT_TOGGLE = 'accordion:toggle';

function toggle(node, nextState, duration = 200) {
  const $node = $(node);

  if (nextState) {
    $node.addClass('accordion_expand');
    $node.find('.accordion__content').slideDown(duration);
  } else {
    $node.removeClass('accordion_expand');
    $node.find('.accordion__content').slideUp(duration);
  }
}

function onToggleClick() {
  const accordionNode = $(this).closest('.accordion');
  const nextState = !accordionNode.hasClass('accordion_expand');
  toggle(accordionNode, nextState);
  accordionNode.trigger(EVENT_TOGGLE, nextState);
}

$('body').on('click', '.accordion__title', onToggleClick);

export default {
  EVENT_TOGGLE,
  toggle,
};

