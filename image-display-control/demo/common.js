const _IMG_ELEMENT_ID = 'myimg';

// eslint-disable-next-line no-unused-vars
function enableCheckboxChanged() {
  const checkbox = document.getElementById('checkbox');
  const imgElement = document.getElementById(_IMG_ELEMENT_ID);
  imgElement.setAttribute('data-disabled', checkbox.checked ? 'none' : 'all');
}

// eslint-disable-next-line no-unused-vars
function resizeClicked() {
  const imgElement = document.getElementById(_IMG_ELEMENT_ID);
  const parentDiv = imgElement.parentElement;
  parentDiv.style.width = '400px';
  parentDiv.style.height = '400px';
}
