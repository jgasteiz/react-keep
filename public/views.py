import json
from flask import render_template, request

from notes import app
from models import Note, db


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/notes')
def notes():
    return json.dumps(_get_notes())


@app.route('/create', methods=['POST'])
def create():
    note_text = request.form['text']
    db.session.add(Note(text=note_text))
    db.session.commit()
    return json.dumps(_get_notes())


@app.route('/update', methods=['PUT'])
def update():
    note = Note.query.filter_by(id=request.form['id']).first()
    note.text = request.form['text']
    db.session.add(note)
    db.session.commit()
    return json.dumps(_get_notes())


@app.route('/delete', methods=['DELETE'])
def delete():
    note = Note.query.filter_by(id=request.form['id']).first()
    db.session.delete(note)
    db.session.commit()
    return json.dumps(_get_notes())


def _get_notes():
    all_notes = Note.query.all()
    return [n.serialize() for n in all_notes]
