from notes import db


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text())

    def __init__(self, text):
        self.text = text

    def __repr__(self):
        return '<Note %r>' % self.text

    def serialize(self):
        return {
            'id': self.id,
            'text': self.text
        }
