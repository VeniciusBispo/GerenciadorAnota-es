document.addEventListener('DOMContentLoaded', () => {
    const homeSection = document.getElementById('home');
    const createNoteSection = document.getElementById('create-note');
    const viewNotesSection = document.getElementById('view-notes');
    const openNotesSection = document.getElementById('open-notes');
    const navHome = document.getElementById('nav-home');
    const navCreate = document.getElementById('nav-create');
    const navView = document.getElementById('nav-view');
    const navOpen = document.getElementById('nav-open');
    const noteForm = document.getElementById('note-form');
    const notesList = document.getElementById('notes-list');
    const searchNotes = document.getElementById('search-notes');
    const addTopicButton = document.getElementById('add-topic');
    const topicsContainer = document.getElementById('topics-container');
    const openTxtFileInput = document.getElementById('open-txt-file');
    const openedNoteContainer = document.getElementById('opened-note');

    let notes = [];

    function showSection(section) {
        homeSection.style.display = 'none';
        createNoteSection.style.display = 'none';
        viewNotesSection.style.display = 'none';
        openNotesSection.style.display = 'none';
        section.style.display = 'block';
    }

    navHome.addEventListener('click', () => {
        showSection(homeSection);
    });

    navCreate.addEventListener('click', () => {
        showSection(createNoteSection);
    });

    navView.addEventListener('click', () => {
        showSection(viewNotesSection);
        displayNotes();
    });

    navOpen.addEventListener('click', () => {
        showSection(openNotesSection);
        openedNoteContainer.innerHTML = '';
    });

    // Carregar anotações salvas no localStorage
    loadNotes();

    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();
        const image = document.getElementById('note-image').files[0];
        const topics = Array.from(document.querySelectorAll('.topic')).map(topicContainer => ({
            title: topicContainer.querySelector('.topic-title').value.trim(),
            content: topicContainer.querySelector('.topic-content').value.trim()
        }));

        // Verificar se o título e o conteúdo não estão vazios
        if (title === '' || content === '') {
            alert('Por favor, preencha o título e o conteúdo da anotação.');
            return;
        }

        // Verificar se a anotação já existe com base no título
        const existingNoteIndex = notes.findIndex(note => note.title === title);
        if (existingNoteIndex !== -1) {
            // Se a anotação já existe, atualiza seus detalhes em vez de criar uma nova
            const existingNote = notes[existingNoteIndex];
            existingNote.content = content;
            existingNote.image = image ? URL.createObjectURL(image) : null;
            existingNote.topics = topics;
        } else {
            // Caso contrário, cria uma nova anotação
            const note = {
                id: Date.now(), // Usar um identificador único
                title,
                content,
                image: image ? URL.createObjectURL(image) : null,
                topics
            };

            notes.push(note);
        }

        saveNotes(); // Salvar anotações no localStorage
        noteForm.reset();
        topicsContainer.innerHTML = '<div class="topic"><input type="text" class="topic-title" placeholder="Título do Tópico"><textarea class="topic-content" placeholder="Conteúdo do Tópico"></textarea></div>';
        alert('Anotação salva com sucesso!');
    });

    function loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            notes = JSON.parse(savedNotes);
            displayNotes();
        }
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    addTopicButton.addEventListener('click', () => {
        const topicContainer = document.createElement('div');
        topicContainer.className = 'topic';
        topicContainer.innerHTML = `
            <input type="text" class="topic-title" placeholder="Título do Tópico">
            <textarea class="topic-content" placeholder="Conteúdo do Tópico"></textarea>
        `;
        topicsContainer.appendChild(topicContainer);
    });

    searchNotes.addEventListener('input', () => {
        const query = searchNotes.value.toLowerCase();
        const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query) || note.topics.some(topic => topic.title.toLowerCase().includes(query) || topic.content.toLowerCase().includes(query)));
        displayNotes(filteredNotes);
    });

    openTxtFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const content = event.target.result;
                parseAndDisplayNoteFromTxt(content);
            };
            reader.readAsText(file);
        }
    });

    function displayNotes(filteredNotes = notes) {
        notesList.innerHTML = '';
        filteredNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';

            const noteTitle = document.createElement('h3');
            noteTitle.textContent = note.title;
            noteItem.appendChild(noteTitle);

            const noteContent = document.createElement('p');
            noteContent.textContent = note.content;
            noteItem.appendChild(noteContent);

            if (note.image) {
                const noteImage = document.createElement('img');
                noteImage.src = note.image;
                noteItem.appendChild(noteImage);
            }

            const noteTopics = document.createElement('div');
            note.topics.forEach(topic => {
                const topicTitle = document.createElement('p');
                topicTitle.innerHTML = `<strong>${topic.title}:</strong> ${topic.content}`;
                noteTopics.appendChild(topicTitle);
            });
            noteItem.appendChild(noteTopics);

            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => editNote(note.id));
            noteItem.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', () => deleteNote(note.id));
            noteItem.appendChild(deleteButton);

            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Baixar TXT';
            downloadButton.addEventListener('click', () => downloadNoteAsTxt(note));
            noteItem.appendChild(downloadButton);

            notesList.appendChild(noteItem);
        });
    }

    function editNote(id) {
        const note = notes.find(n => n.id === id);
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        topicsContainer.innerHTML = '';
        note.topics.forEach(topic => {
            const topicContainer = document.createElement('div');
            topicContainer.className = 'topic';
            topicContainer.innerHTML = `
                <input type="text" class="topic-title" value="${topic.title}">
                <textarea class="topic-content">${topic.content}</textarea>
            `;
            topicsContainer.appendChild(topicContainer);
        });
        if (note.image) {
            const noteImage = document.createElement('img');
            noteImage.src = note.image;
            noteImage.style.maxWidth = '100%';
            noteImage.style.marginTop = '1em';
            topicsContainer.appendChild(noteImage);
        }
        deleteNote(id);
        navCreate.click();
    }

    function deleteNote(id) {
        notes = notes.filter(note => note.id !== id);
        saveNotes(); // Atualizar o localStorage após excluir a anotação
        displayNotes();
    }

    function downloadNoteAsTxt(note) {
        const element = document.createElement('a');
        const noteContent = `
Título: ${note.title}
Conteúdo: ${note.content}
Tópicos: ${note.topics.map(topic => `\n- ${topic.title}: ${topic.content}`).join('')}
        `;
        const file = new Blob([noteContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${note.title}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    function parseAndDisplayNoteFromTxt(content) {
        const lines = content.split('\n');
        const titleIndex = lines.findIndex(line => line.startsWith('Título:'));
        const contentIndex = lines.findIndex(line => line.startsWith('Conteúdo:'));
        const topicsIndex = lines.findIndex(line => line.startsWith('Tópicos:'));

        const title = titleIndex !== -1 ? lines[titleIndex].replace('Título: ', '').trim() : '';
        const noteContent = contentIndex !== -1 ? lines[contentIndex].replace('Conteúdo: ', '').trim() : '';

        const topics = [];
        if (topicsIndex !== -1) {
            for (let i = topicsIndex + 1; i < lines.length; i++) {
                if (lines[i].startsWith('- ')) {
                    const [topicTitle, topicContent] = lines[i].substring(2).split(': ');
                    topics.push({ title: topicTitle.trim(), content: topicContent.trim() });
                }
            }
        }

        const note = {
            id: Date.now(),
            title,
            content: noteContent,
            image: null,
            topics
        };

        openedNoteContainer.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <div>
                ${note.topics.map(topic => `<p><strong>${topic.title}:</strong> ${topic.content}</p>`).join('')}
            </div>
            <button id="edit-opened-note">Editar</button>
        `;

        document.getElementById('edit-opened-note').addEventListener('click', () => editOpenedNote(note));
    }

    function editOpenedNote(note) {
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        topicsContainer.innerHTML = '';
        note.topics.forEach(topic => {
            const topicContainer = document.createElement('div');
            topicContainer.className = 'topic';
            topicContainer.innerHTML = `
                <input type="text" class="topic-title" value="${topic.title}">
                <textarea class="topic-content">${topic.content}</textarea>
            `;
            topicsContainer.appendChild(topicContainer);
        });
        if (note.image) {
            const noteImage = document.createElement('img');
            noteImage.src = note.image;
            noteImage.style.maxWidth = '100%';
            noteImage.style.marginTop = '1em';
            topicsContainer.appendChild(noteImage);
        }
        navCreate.click();
    }

    // Exibir a tela inicial por padrão
    showSection(homeSection);
});
