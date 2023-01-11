function getBackendData() {
    return fetch('http://localhost:3000/tasks').then((response) => {
        return response.json();
    });

}

const tasks = [];

getBackendData().then((data) => {
    console.log(data);
    tasks.push(...data);
    console.log(tasks);
}).then(() => {
    groupToColumns(tasks);
})

function groupToColumns(tasks) {
    tasks.forEach(task => {
        const card = createCard(task.title, task.description, new Date(), task.id);

        if (task.completed) {
            addCardToColumn(card, getDoneColumn());
            card.classList.add('text-bg-success');
            addCloseButtonToCard(card);
            return
        }
        if (task.isInProgress) {
            addCardToColumn(card, getInProgressColumn());
            return
        }
        addCardToColumn(card, getTodoColumn());
    })
}

function createCard(title, description, date, id) {

    const h5 = document.createElement('h5');
    h5.classList.add('card-title');
    h5.innerText = title;

    const h6 = document.createElement('h6');
    h6.classList.add('card-subtitle', 'mb-2');
    h6.innerText = moment(date).fromNow();

    const p = document.createElement('p');
    p.classList.add('card-text');
    p.innerText = description;

    const cardContainer = document.createElement('div');
    cardContainer.appendChild(h5);
    cardContainer.appendChild(h6);
    cardContainer.appendChild(p);
    cardContainer.classList.add('card-body');

    const card = document.createElement('div');
    card.appendChild(cardContainer);
    card.classList.add('card', 'm-2', 'p-2');
    card.setAttribute('data-id', id);

    card.addEventListener('click', functionSelectCard);

    return card
}

function deleteTask(taskId) {
    return fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "DELETE"
    })
}

function removeCard(event) {
    const button = event.currentTarget;
    const card = button.parentElement.parentElement;
    card.parentElement.removeChild(card);

    const taskId = extractIdFromCard(card);
    deleteTask(taskId);

}

function addCloseButtonToCard(card) {
    const closeButton = document.createElement('a');
    closeButton.innerText = 'Remove';
    closeButton.classList.add('card-link', 'btn', 'btn-light');

    closeButton.addEventListener('click', removeCard);

    const cardBody = card.querySelector('div');
    cardBody.appendChild(closeButton);
}

function addCardToColumn(card, column) {
    document.querySelector(column).appendChild(card);
}

function getTodoColumn() {
    return '.col-to-do'
}
function getInProgressColumn() {
     return '.col-in-progress'
}
function getDoneColumn() {
     return '.col-done'
}

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const form = event.target;

    const title = form.querySelector('input');
    const description = form.querySelector('textarea');
    const date = new Date();

    const card = createCard(title.value, description.value, date);

    document.querySelector('.col-to-do').appendChild(card);
});

const functionSelectCard = event => {
    const card = event.currentTarget;
    if (card.classList.contains('text-bg-secondary')) {
        card.classList.remove('text-bg-secondary');
    } else {
        deselectAllCards();

        selectCard(card);
    }
};

function deselectAllCards() {
    document.querySelectorAll('.text-bg-secondary').forEach(c => {
        c.classList.remove('text-bg-secondary');
    });
}

function selectCard(card) {
    card.classList.add('text-bg-secondary');
}

document.querySelectorAll('.card').forEach(card => {

    card.addEventListener('click', functionSelectCard);

});

function updateTaskStatus(task, status) {
    if (status === "isInProgress") {
        task.isInProgress = true;
    } else {
        task.completed = true;
    }
    return fetch(`http://localhost:3000/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify(task),
        headers: {
            "Content-Type": "application/json"
        }
    })
}

function extractIdFromCard(card) {
   return card.getAttribute('data-id');
}

document.querySelector('.btn-move-in-progress').addEventListener('click', event => {

    const card = document.querySelector('.col-to-do .card.text-bg-secondary');

    const taskId = extractIdFromCard(card);
    updateTaskStatus(tasks.find((t) => t.id == taskId), 'isInProgress').then(() => {
        card.parentElement.removeChild(card);
        document.querySelector('.col-in-progress').appendChild(card);
        deselectAllCards();
    });
});

document.querySelector('.btn-move-in-done').addEventListener('click', event => {

    const card = document.querySelector('.col-in-progress .card.text-bg-secondary');

    const taskId = extractIdFromCard(card);
    updateTaskStatus(tasks.find((t) => t.id == taskId), "completed").then(() => {
        card.parentElement.removeChild(card);
        card.classList.add('text-bg-success');
        addCloseButtonToCard(card);
        document.querySelector('.col-done').appendChild(card);
        deselectAllCards();
    });
});