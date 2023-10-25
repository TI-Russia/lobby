window.LAYOUT_VARS = {
  type: "{{page.type}}",
  layout: "{{page.layout}}",
  permalink: "{{page.permalink}}",
  feedbackUrl: "{{ site.feedback_url[page.type] }}",
  isProd: /dumabingo.org/.test(window.location.href),
};
