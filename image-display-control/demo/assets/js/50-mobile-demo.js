// See https://interactjs.io/docs/resizable/
// eslint-disable-next-line no-undef
interact('.resizable').resizable({
  edges: { bottom: '.resizer', right: '.resizer' },
  listeners: {
    move(event) {
      let { x, y } = event.target.dataset;

      x = (parseFloat(x) || 0) + event.deltaRect.left;
      y = (parseFloat(y) || 0) + event.deltaRect.top;

      Object.assign(event.target.style, {
        width: `${event.rect.width}px`,
        height: `${event.rect.height}px`,
        transform: `translate(${x}px, ${y}px)`,
      });

      Object.assign(event.target.dataset, { x, y });
    },
  },
});
