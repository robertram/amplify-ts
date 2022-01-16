import React, { useState, useEffect } from "react";
import "./App.css";
import { API } from "aws-amplify";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { listNotes, listUsers } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  updateUser as updateUserMutation,
} from "./graphql/mutations";
import { Storage } from "aws-amplify";

const initialFormState = { name: "", description: "" };
const initialUserFormState = { name: "", profilePicture: "" };

function App({}) {
  const [notes, setNotes] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [userFormData, setUserFormData] = useState(initialUserFormState);
  const [image, setImage] = useState<any>("avatar");

  useEffect(() => {
    fetchNotes();
    fetchUsers();
    onPageRendered();
  }, []);

  const onPageRendered = async () => {
    getProfilePicture();
  };

  const getProfilePicture = () => {
    Storage.get("profilePicture.png")
      .then((url) => {
        var myRequest = new Request(url);
        fetch(myRequest).then(function (response) {
          if (response.status === 200) {
            setImage(url);
          }
        });
      })
      .catch((err) => console.log(err));
  };

  async function fetchNotes() {
    const apiData: any = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  async function fetchUsers() {
    const apiData: any = await API.graphql({ query: listUsers });
    setUsers(apiData.data.listUsers.items);
  }

  async function updateUser() {
    if (!userFormData.name || !userFormData.profilePicture) return;
    await API.graphql({
      query: updateUserMutation,
      variables: { input: userFormData },
    });
    setUsers([...users, userFormData]);
    setUserFormData(initialUserFormState);
    console.log("userFormData", userFormData);
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

  let fileInput: any = React.createRef();

  const onOpenFileDialog = () => {
    fileInput.current.click();
  };

  const onProcessFile = (e: any) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      console.log(err);
    }
    reader.onloadend = () => {
      setImage(reader.result);
    };
    Storage.put("profilePicture.png", file, {
      contentType: "image/png",
    })
      .then((result: any) => console.log(result))
      .catch((err: any) => console.log(err));
    setUserFormData({ ...userFormData, profilePicture: file });
  };

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
      </div>

      <hr className="Divider" />

      <div className="CreateNoteContainer">
        <h2>User Data</h2>
        <div className="InputsContainer">
          <div className="">
            <p>Name</p>
            <input
              onChange={(e) =>
                setUserFormData({ ...userFormData, name: e.target.value })
              }
              placeholder="What is your name?"
              value={userFormData.name}
            />
          </div>
          <div className="">
            <p>Profile Picture</p>

            <a href="#">
              <input
                type="file"
                onChange={onProcessFile}
                ref={fileInput}
                hidden={true}
                placeholder="Upload Profile Image"
              />
            </a>
            <img
              src={image}
              onClick={onOpenFileDialog}
              className="ProfileImageContainer"
            />
          </div>
        </div>
        <button onClick={updateUser}>Update User Information</button>
      </div>

      <div className="">
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
