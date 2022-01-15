import React, { useState, useEffect } from "react";
import "./App.css";
import { API } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { listNotes, listUsers } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";

const initialFormState = { name: "", description: "" };

function App({}) {
  const [notes, setNotes] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
    fetchUsers();
  }, []);

  async function fetchNotes() {
    const apiData: any = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  async function fetchUsers() {
    const apiData: any = await API.graphql({ query: listUsers });
    setUsers(apiData.data.listUsers.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createNoteMutation,
      variables: { input: formData },
    });
    setNotes([...notes, formData]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }: any) {
    const newNotesArray = notes.filter((note: any) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <div className="App">
      <div className="Header">
        <h1>Robert's Amplify Notes App</h1>
        <div className="SignOutButton">
          <AmplifySignOut />
        </div>
      </div>
      <div className="CreateNoteContainer">
        <h2>Create Note</h2>
        <div className="InputsContainer">
          <div className="">
            <p>Name</p>
            <input
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Note name"
              value={formData.name}
            />
          </div>
          <div className="">
            <p>Description</p>
            <input
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Note description"
              value={formData.description}
            />
          </div>
        </div>
        <button onClick={createNote}>Create Note</button>
      </div>
      <div style={{ marginBottom: 30 }}>
        {notes.map((note: any) => (
          <div key={note.id || note.name} className="Note">
            <h2>{note.name}</h2>
            <p>{note.description}</p>
            <button onClick={() => deleteNote(note)}>Delete note</button>
          </div>
        ))}

        {users.map((user: any) => (
          <div key={user.id || user.name} className="Note">
            <h2>{user.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuthenticator(App);
