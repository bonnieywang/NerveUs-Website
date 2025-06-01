function toggleSkinOverlay() {
  const skinOverlay = document.getElementById('skinOverlay');
  const skinButton = document.getElementById('toggleSkinOverlayBtn');
  
  // Toggle the visibility of the skin overlay
  if (skinOverlay.style.display === 'none' || skinOverlay.style.display === '') {
      skinOverlay.style.display = 'block';
      
      // Change the button to active state
      skinButton.classList.add('active');
      skinButton.classList.remove('inactive');

      // Change the button text to 'Hide'
      skinButton.textContent = 'Hide Skin';
  } else {
      skinOverlay.style.display = 'none';
      
      // Change the button to inactive state
      skinButton.classList.add('inactive');
      skinButton.classList.remove('active');

      // Change the button text to 'Show'
      skinButton.textContent = 'Show Skin';
  }
}

function toggleBoneOverlay() {
  const boneBehind = document.getElementById('boneBehind');
  const boneFront = document.getElementById('boneFront');
  const boneButton = document.getElementById('toggleBoneOverlayBtn');
  
  // Check if both bone overlays are currently hidden
  const isHidden = (boneBehind.style.display === 'none' || boneFront.style.display === '');
  
  // If hidden, show both and set button to active state; otherwise, hide both and set to inactive
  if (isHidden) {
      boneBehind.style.display = 'block';
      boneFront.style.display = 'block';
      
      // Change the button to active state
      boneButton.classList.add('active');
      boneButton.classList.remove('inactive');

      // Change the button text to 'Hide'
      boneButton.textContent = 'Hide Bone';
  } else {
      boneBehind.style.display = 'none';
      boneFront.style.display = 'none';
      
      // Change the button to inactive state
      boneButton.classList.add('inactive');
      boneButton.classList.remove('active');

      // Change the button text to 'Show'
      boneButton.textContent = 'Show Bone';
  }
}
