// Scroll boxes with nothing focusable inside cannot be scrolled from the
// keyboard in WebKit, so each one gets a tab stop while, and only while,
// its content overflows. Tables also become a named region so the stop
// is announced.
const boxes = document.querySelectorAll(
  '.adr-content pre, .adr-content .table-scroll',
);

let captionCount = 0;

function label(box) {
  const caption = box.querySelector('caption');
  if (!caption) {
    box.setAttribute('aria-label', 'Scrollable table');
    return;
  }
  caption.id ||= `scrollable-caption-${++captionCount}`;
  box.setAttribute('aria-labelledby', caption.id);
}

function update(box) {
  const overflows = box.scrollWidth > box.clientWidth;
  if (overflows === box.hasAttribute('tabindex')) return;

  if (overflows) {
    box.setAttribute('tabindex', '0');
    if (box.matches('.table-scroll')) {
      box.setAttribute('role', 'region');
      label(box);
    }
  } else {
    for (const name of ['tabindex', 'role', 'aria-label', 'aria-labelledby']) {
      box.removeAttribute(name);
    }
  }
}

// The content is observed as well as the box, since a late web font can
// widen a table without the box itself changing size.
const observer = new ResizeObserver((entries) => {
  for (const { target } of entries) {
    update(target.closest('pre, .table-scroll'));
  }
});

for (const box of boxes) {
  observer.observe(box);
  if (box.firstElementChild) observer.observe(box.firstElementChild);
}
