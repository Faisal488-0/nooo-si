// Runs before first paint: set language + direction to avoid a flash of the wrong layout.
(function () {
  var l = 'ar';
  try {
    var q = new URLSearchParams(location.search).get('lang');
    var s = localStorage.getItem('nooo.lang');
    l = q === 'en' || q === 'ar' ? q : s === 'en' || s === 'ar' ? s : (navigator.language || 'ar').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
  } catch (e) { /* storage blocked */ }
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.classList.add('js');
})();
