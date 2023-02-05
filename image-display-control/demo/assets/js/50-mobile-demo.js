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

function picSelectorClicked(buttonId) {
  // eslint-disable-next-line no-undef
  const imgElement = document.getElementById(_IMG_ELEMENT_ID);
  switch (buttonId) {
    case 'car':
      imgElement.src = 'demo/assets/pics/car.webp';
      imgElement.dataset.imageRegions = `[{
        "id": "horizontalbanner",
        "names": ["Horizontal banner"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "4933",
        "imageHeight": "3289",
        "x": "520",
        "y": "1026",
        "width": "3695",
        "height": "1385"
      }, {
        "id": "square",
        "names": ["Square"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "4933",
        "imageHeight": "3289",
        "x": "804",
        "y": "807",
        "width": "1647",
        "height": "1647"
      }, {
        "id": "tallportrait",
        "names": ["Tall portrait"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "4933",
        "imageHeight": "3289",
        "x": "730",
        "y": "79",
        "width": "1204",
        "height": "3210"
      }]`;
      break;

    case 'surfer':
      imgElement.src = 'demo/assets/pics/surfer.webp';
      imgElement.dataset.imageRegions = `[{
        "id": "horizontalbanner",
        "names": ["Horizontal banner"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "2905",
        "imageHeight": "1937",
        "x": "0",
        "y": "426",
        "width": "2905",
        "height": "1089"
      }, {
        "id": "square",
        "names": ["Square"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "2905",
        "imageHeight": "1937",
        "x": "795",
        "y": "0",
        "width": "1937",
        "height": "1937"
      }, {
        "id": "tallportrait",
        "names": ["Tall portrait"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "2905",
        "imageHeight": "1937",
        "x": "2035",
        "y": "0",
        "width": "726",
        "height": "1937"
      }]`;
      break;

    case 'skater':
    default:
      imgElement.src = 'demo/assets/pics/skater.webp';
      imgElement.dataset.imageRegions = `[{
        "id": "horizontalbanner",
        "names": ["Horizontal banner"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "5760",
        "imageHeight": "3840",
        "x": "2343",
        "y": "858",
        "width": "3417",
        "height": "1281"
      }, {
        "id": "square",
        "names": ["Square"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "5760",
        "imageHeight": "3840",
        "x": "2462",
        "y": "1097",
        "width": "782",
        "height": "782"
      }, {
        "id": "tallportrait",
        "names": ["Tall portrait"],
        "shape": "rectangle",
        "unit": "pixel",
        "imageWidth": "5760",
        "imageHeight": "3840",
        "x": "2345",
        "y": "850",
        "width": "1122",
        "height": "2990"
      }]`;
      break;
  }

  document.querySelectorAll('.pic-selector').forEach(element => {
    if (element.id === buttonId) {
      element.classList.add('purple');
    } else {
      element.classList.remove('purple');
    }
  });
}

function modeSelectorClicked(buttonId) {
  // eslint-disable-next-line no-undef
  const imgElement = document.getElementById(_IMG_ELEMENT_ID);
  switch (buttonId) {
    case 'off':
      imgElement.dataset.disabled = 'all';
      break;

    case 'debug':
      imgElement.dataset.disabled = 'none';
      imgElement.dataset.debugDrawRegions = 'on';
      break;

    case 'on':
    default:
      imgElement.dataset.disabled = 'none';
      imgElement.dataset.debugDrawRegions = 'off';
      break;
  }

  document.querySelectorAll('.mode-selector').forEach(element => {
    if (element.id === buttonId) {
      element.classList.add('purple');
    } else {
      element.classList.remove('purple');
    }
  });
}

picSelectorClicked('skater');
modeSelectorClicked('on');
