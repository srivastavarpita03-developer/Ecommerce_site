import "./AdminCategory.css";
import { RxCross2 } from "react-icons/rx";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const categories = [
  {
    _id: "1",
    name: "Men",
    icon: "👔",
    subcategory: ["T-Shirts", "Shirts", "Jeans", "Hoodies", "Jackets"],
    createdAt: "14 Jul 2026",
  },
  {
    _id: "2",
    name: "Women",
    icon: "👗",
    subcategory: ["Dresses", "Tops", "Kurtis", "Jeans", "Skirts"],
    createdAt: "13 Jul 2026",
  },
  {
    _id: "3",
    name: "Kids",
    icon: "🧒",
    subcategory: ["Boys Wear", "Girls Wear", "Baby Clothing", "School Wear"],
    createdAt: "12 Jul 2026",
  },
];

function AdminCategory() {
  const [data, setData] = useState({
    name: "",
    icon: "",
    subcategory: "",
  });
  const [editId, setEditId] = useState(null);

  const [categories, setCategories] = useState([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newData = {
      ...data,
      categoryId: editId,
      subcategory: data.subcategory
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      let response;

      if (editId) {
        response = await api.put(`/category`, newData);
        alert("Category Updated!");
      } else {
        response = await api.post("/category", newData);
        alert("Category Added!");
      }

      if (response.data.success) {
        setIsMenuOpen(false);
        setEditId(null);
        setData({
          name: "",
          icon: "",
          subcategory: "",
        });

        getData();
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  }

  function handleEdit(category) {
    setEditId(category._id);

    setData({
      name: category.name,
      icon: category.icon,
      subcategory: category.subcategory.join("\n"),
    });

    setIsMenuOpen(true);
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/category`, {
        data: { categoryId: id },
      });

      if (response.data.success) {
        alert("Category Deleted!");
        getData();
      }
    } catch (err) {
      console.log(err);
      alert("Unable to delete category");
    }
  }

  async function getData() {
    const response = await api.get("/category");
    const res = response.data;
    if (res?.success) {
      console.log(res);
      setCategories(res?.data);
    }
  }
  useEffect(() => {
    getData();
  }, []);

  return (
    <section className="adminCategory">
      {/* Add Category Modal */}

      {isMenuOpen && (
        <div className="categoryOverlay">
          <form className="categoryForm">
            <div className="categoryHeader">
              <h2>{editId ? "Update Category" : "Add Category"}</h2>

              <RxCross2
                className="closeBtn"
                onClick={() => {
                  setIsMenuOpen(false);
                  setEditId(null);
                  setData({
                    name: "",
                    icon: "",
                    subcategory: "",
                  });
                }}
              />
            </div>

            <div className="categoryBody">
              <div className="formRow">
                <label>Category Name</label>
                <input
                  type="text"
                  placeholder="Category Name"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                />
              </div>

              <div className="formRow">
                <label>Icon</label>
                <input
                  type="text"
                  placeholder="🛋️ or Icon URL"
                  name="icon"
                  value={data.icon}
                  onChange={handleChange}
                />
              </div>

              <div className="formRow">
                <label>Sub Categories</label>

                <textarea
                  rows="5"
                  placeholder="One sub category per line"
                  name="subcategory"
                  value={data.subcategory}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button className="submitBtn" onClick={handleSubmit}>
                {editId ? "Update Category" : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}

      <div className="categoryTop">
        <h1>Categories</h1>

        <button
          onClick={() => {
            setEditId(null);
            setData({
              name: "",
              icon: "",
              subcategory: "",
            });
            setIsMenuOpen(true);
          }}
        >
          Add Category
        </button>
      </div>

      {/* Table */}

      <div className="tableWrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Icon</th>
              <th>Sub Categories</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>

                <td className="iconCell">{cat.icon}</td>

                <td>{cat.subcategory.join(", ")}</td>

                <td>{new Date(cat.createdAt).toLocaleDateString("en-GB")}</td>

                <td>
                  <button className="editBtn" onClick={() => handleEdit(cat)}>
                    <FaEdit />
                  </button>

                  <button
                    className="deleteBtn"
                    onClick={() => handleDelete(cat._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminCategory;
