(function() {
    'use strict';

    var converter = new Showdown.converter();

    var Note = React.createClass({
        deleteNote: function(e) {
            e.preventDefault();
            this.props.deleteNote(this.props.id);
        },
        updateNote: function(note) {
            this.refs.noteForm.getDOMNode().style.display = "none";
            this.refs.noteContent.getDOMNode().style.display = "block";
            this.props.updateNote({id: note.id, text: note.text});
        },
        showNoteEditor: function(e) {
            e.preventDefault();
            this.refs.noteForm.getDOMNode().querySelector('textarea').value =
                this.props.children;
            this.refs.noteContent.getDOMNode().style.display = "none";
            this.refs.noteForm.getDOMNode().style.display = "block";
        },
        render: function() {
            var rawMarkup = converter.makeHtml(this.props.children.toString());
            return (
                <div className="note">
                    <div
                        className="note__content"
                        dangerouslySetInnerHTML={{__html: rawMarkup}}
                        ref="noteContent"
                    />
                    <NoteForm
                        ref="noteForm"
                        hide="true"
                        text={this.props.children}
                        id={this.props.id}
                        onNoteSubmit={this.updateNote}
                    />
                    <div className="note__controls">
                        <a href="#" onClick={this.showNoteEditor}>Edit</a>
                        <a href="#" onClick={this.deleteNote}>Delete</a>
                    </div>
                </div>
            );
        }
    });

    var NoteList = React.createClass({
        render: function() {
            var deleteNote = this.props.deleteNote,
                updateNote = this.props.updateNote,
                noteNodes;

            noteNodes = this.props.data.map(function (note) {
                return (
                    <Note
                        deleteNote={deleteNote}
                        updateNote={updateNote}
                        id={note.id}>
                        {note.text}
                    </Note>
                );
            });

            return (
                <div className="noteList">
                    {noteNodes}
                </div>
            );
        }
    });

    var NoteForm = React.createClass({
        handleSubmit: function(e) {
            e.preventDefault();
            var text = this.refs.text.getDOMNode().value.trim();

            if (!text) {
                alert('Enter some text');
                return false;
            }

            this.props.onNoteSubmit({id: this.props.id, text: text});

            this.refs.text.getDOMNode().value = '';
            return false;
        },
        getStyle: function() {
            return this.props.hide ? {display: 'none'} : {};
        },
        getText: function() {
            if (this.props.text) {
                return this.props.text;
            }
            return '';
        },
        render: function() {
            return (
                <form
                    style={this.getStyle()}
                    className="noteForm"
                    onSubmit={this.handleSubmit}>
                    <div>
                        <textarea
                            placeholder="Add note"
                            ref="text">{this.getText()}</textarea>
                    </div>
                    <p><input type="submit" value="DONE"/></p>
                </form>
            );
        }
    });

    var NoteBox = React.createClass({
        renderData: function(responseText) {
            var data = JSON.parse(responseText);
            this.setState({data: data}, null);
        },
        handleAjaxRequest: function(method, url, payload, callback) {
            var r = new XMLHttpRequest();
            r.open(method, url, true);
            r.onreadystatechange = (function () {
                if (r.readyState !== 4 || r.status !== 200) {
                    return false;
                }
                if (r.status !== 200) {
                    console.error(url, status, r.responseText);
                } else {
                    callback(r.responseText);
                }
            }).bind(this);
            r.send(payload);
        },
        loadNotesFromServer: function() {
            this.handleAjaxRequest('GET', this.props.pollUrl, undefined, this.renderData);
        },
        handleNoteSubmit: function(note) {
            // Add the note to the list before it gets posted.
            var notes = this.state.data;
            var newNotes = notes.concat([note]);
            this.setState({data: newNotes}, null);

            var data = new FormData();
            data.append('text', note.text);

            this.handleAjaxRequest('POST', this.props.createUrl, data, this.renderData);
        },
        deleteNote: function(id) {
            var data = new FormData();
            data.append('id', id);

            this.handleAjaxRequest('DELETE', this.props.deleteUrl, data, this.renderData);
        },
        updateNote: function(note) {
            var data = new FormData();
            data.append('id', note.id);
            data.append('text', note.text);

            this.handleAjaxRequest('PUT', this.props.updateUrl, data, this.renderData);
        },
        getInitialState: function() {
            return {data: []};
        },
        componentDidMount: function() {
            this.loadNotesFromServer();
            window.setInterval(this.loadNotesFromServer, this.props.pollInterval);
        },
        render: function() {
            return (
                <div className="noteBox">
                    <NoteForm onNoteSubmit={this.handleNoteSubmit} />
                    <NoteList
                        data={this.state.data}
                        deleteNote={this.deleteNote}
                        updateNote={this.updateNote}
                    />
                </div>
            );
        }
    });

    React.render(
        <NoteBox
            pollUrl="notes"
            createUrl="create"
            deleteUrl="delete"
            updateUrl="update"
            pollInterval={2000} />,
        document.getElementById('content')
    );
})();