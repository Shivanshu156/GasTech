function updateDate() {
    const dateElement = document.getElementById('date');
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);
    dateElement.textContent = formattedDate;
  }

  // Function to update the order of boxes based on the selected date
  function updateOrder() {
    const boxContainer = document.getElementById('boxContainer');
    const selectedDate = new Date(document.getElementById('dateInput').value);
    const dayOfMonth = selectedDate.getDate();

    // Rearrange the boxes based on the day of the month
    if (dayOfMonth <= 2) {
      boxContainer.innerHTML = `
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
        </div>
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
          <div class="box"></div>
        </div>
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
        </div>
      `;
    } else if (dayOfMonth === 3) {
      boxContainer.innerHTML = `
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
        </div>
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
          <div class="box"></div>
        </div>
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
        </div>
      `;
    } else {
      boxContainer.innerHTML = `
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
        </div>
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
          <div class="box"></div>
        </div>
        <div class="row">
          <div class="box"></div>
          <div class="box"></div>
        </div>
      `;
    }
  }

  // Call the function to set the initial date
  updateDate();
