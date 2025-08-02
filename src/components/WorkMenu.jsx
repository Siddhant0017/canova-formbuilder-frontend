// src/components/WorkMenu.jsx
import { useEffect, useRef } from "react";
import api from "../services/api";
import "./WorkMenu.css";

const WorkMenu = ({
  type,               // "form" | "project"
  item,               // the full object { _id, title … } or { _id, name … }
  onClose,
  refresh            // callback to reload dashboard lists
}) => {
  const ref = useRef(null);

  /* close if you click outside the menu */
  useEffect(() => {
    const handler = (e) =>
      ref.current && !ref.current.contains(e.target) && onClose();
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  /* ------------------ MENU ACTIONS ------------------ */
  const share = async () => {
    try {
      const { data } = await api.get(`/${type}s/${item._id}/share-link`);
      await navigator.clipboard.writeText(data.url);
      alert("Link copied to clipboard");
      onClose();
    } catch { 
      alert("Could not copy link"); 
    }
  };

  const rename = async () => {
    const titleProp = type === "form" ? "title" : "name";
    const current = item[titleProp];
    const next = prompt("New name", current);
    if (!next || next === current) return;

    try {
      await api.put(`/${type}s/${item._id}`, { [titleProp]: next });
      refresh();
      onClose();
    } catch {
      alert("Failed to rename");
    }
  };

  const copy = async () => {
    try {
      await api.post(`/${type}s/${item._id}/duplicate`);
      refresh();
      onClose();
    } catch {
      alert("Failed to copy");
    }
  };

  const deleteItem = async () => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      await api.delete(`/${type}s/${item._id}`);
      refresh();
      onClose();
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <ul className="work-menu" ref={ref}>
      <li onClick={share}>Share</li>
      <li onClick={rename}>Rename</li>
      <li onClick={copy}>Copy</li>
      <li className="danger" onClick={deleteItem}>Delete</li>
    </ul>
  );
};

export default WorkMenu;
