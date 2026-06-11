const Environment = require("../models/Environment");

const getAll = async (req, res) => {
  try {
    const envs = await Environment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: envs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch environments", details: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const env = await Environment.findById(req.params.id);
    if (!env) return res.status(404).json({ error: "Environment not found" });
    res.json({ success: true, data: env });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch environment", details: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, variables } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const env = await Environment.create({ name, variables: variables || [] });
    res.status(201).json({ success: true, data: env });
  } catch (err) {
    if (err.name === "ValidationError")
      return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Failed to create environment", details: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, variables } = req.body;
    const env = await Environment.findByIdAndUpdate(
      req.params.id,
      { name, variables },
      { new: true, runValidators: true }
    );
    if (!env) return res.status(404).json({ error: "Environment not found" });
    res.json({ success: true, data: env });
  } catch (err) {
    res.status(500).json({ error: "Failed to update environment", details: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const env = await Environment.findByIdAndDelete(req.params.id);
    if (!env) return res.status(404).json({ error: "Environment not found" });
    res.json({ success: true, message: "Environment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete environment", details: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };