import { ObjectId } from "mongodb";

function isObjectId(value) {
  return value instanceof ObjectId;
}

function idEquals(a, b) {
  if (isObjectId(a) && isObjectId(b)) return a.equals(b);
  return String(a) === String(b);
}

function matchesDoc(doc, filter) {
  for (const [key, expected] of Object.entries(filter || {})) {
    if (expected && typeof expected === "object" && expected.$regex instanceof RegExp) {
      const value = doc[key] == null ? "" : String(doc[key]);
      if (!expected.$regex.test(value)) return false;
      continue;
    }
    const actual = doc[key];
    if (expected === null || expected === undefined) {
      if (actual !== expected) return false;
      continue;
    }
    if (isObjectId(actual) || isObjectId(expected)) {
      if (!idEquals(actual, expected)) return false;
      continue;
    }
    if (actual !== expected) return false;
  }
  return true;
}

function applyUpdate(target, update) {
  if (update.$set) {
    for (const [key, value] of Object.entries(update.$set)) target[key] = value;
  }
}

function applySetOnInsert(target, update) {
  if (update.$setOnInsert) {
    for (const [key, value] of Object.entries(update.$setOnInsert)) {
      if (target[key] === undefined) target[key] = value;
    }
  }
}

class Cursor {
  constructor(db, name, filter) {
    this.db = db;
    this.name = name;
    this.filter = filter;
    this.sortSpec = null;
    this.limitSpec = null;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(n) {
    this.limitSpec = n;
    return this;
  }

  results() {
    let docs = this.db.raw(this.name).filter((d) => matchesDoc(d, this.filter));
    if (this.sortSpec) {
      const keys = Object.keys(this.sortSpec);
      docs = [...docs].sort((a, b) => {
        for (const key of keys) {
          const dir = this.sortSpec[key];
          const av = a[key];
          const bv = b[key];
          if (av === bv) continue;
          if (av == null) return -1;
          if (bv == null) return 1;
          if (av < bv) return -1;
          if (av > bv) return 1;
        }
        return 0;
      });
    }
    if (this.limitSpec !== null && this.limitSpec !== undefined) {
      docs = docs.slice(0, this.limitSpec);
    }
    return docs;
  }

  async toArray() {
    return this.results();
  }

  async next() {
    return this.results()[0] || null;
  }
}

class Collection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  async insertOne(doc) {
    const fresh = { ...doc };
    if (fresh._id === undefined) fresh._id = new ObjectId();
    this.db.raw(this.name).push(fresh);
    return { insertedId: fresh._id, acknowledged: true };
  }

  async findOne(filter) {
    return this.db.raw(this.name).find((d) => matchesDoc(d, filter || {})) || null;
  }

  find(filter) {
    return new Cursor(this.db, this.name, filter || {});
  }

  async findOneAndUpdate(filter, update, opts = {}) {
    const docs = this.db.raw(this.name);
    const existing = docs.find((d) => matchesDoc(d, filter || {}));
    if (existing) {
      applyUpdate(existing, update);
      return { value: existing };
    }
    if (opts.upsert) {
      const fresh = { ...(filter || {}) };
      fresh._id = fresh._id || new ObjectId();
      applyUpdate(fresh, update);
      applySetOnInsert(fresh, update);
      docs.push(fresh);
      return { value: fresh };
    }
    return { value: null };
  }

  async findOneAndDelete(filter) {
    const docs = this.db.raw(this.name);
    const index = docs.findIndex((d) => matchesDoc(d, filter || {}));
    if (index < 0) return { value: null };
    const [removed] = docs.splice(index, 1);
    return { value: removed };
  }

  async updateOne(filter, update) {
    const docs = this.db.raw(this.name);
    let modified = 0;
    for (const doc of docs) {
      if (matchesDoc(doc, filter || {})) {
        applyUpdate(doc, update);
        modified += 1;
      }
    }
    return { modifiedCount: modified, acknowledged: true };
  }

  async updateMany(filter, update) {
    return this.updateOne(filter, update);
  }

  async deleteOne(filter) {
    const docs = this.db.raw(this.name);
    const index = docs.findIndex((d) => matchesDoc(d, filter || {}));
    if (index < 0) return { deletedCount: 0, acknowledged: true };
    docs.splice(index, 1);
    return { deletedCount: 1, acknowledged: true };
  }

  async deleteMany(filter) {
    const docs = this.db.raw(this.name);
    const before = docs.length;
    const kept = docs.filter((d) => !matchesDoc(d, filter || {}));
    docs.length = 0;
    docs.push(...kept);
    return { deletedCount: before - kept.length, acknowledged: true };
  }

  async countDocuments(filter) {
    return this.db.raw(this.name).filter((d) => matchesDoc(d, filter || {})).length;
  }

  async createIndex() {
    return "index-ok";
  }
}

export class MemoryDb {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) this.collections.set(name, []);
    if (!this.collections.get(name).collection) {
      const docs = this.collections.get(name);
      docs.collection = new Collection(this, name);
    }
    return this.collections.get(name).collection;
  }

  raw(name) {
    if (!this.collections.has(name)) this.collections.set(name, []);
    return this.collections.get(name);
  }

  seed(name, docs) {
    const arr = this.raw(name);
    arr.length = 0;
    arr.push(...docs.map((d) => ({ _id: d._id instanceof ObjectId ? d._id : new ObjectId(), ...d })));
    return arr;
  }

  clear() {
    for (const arr of this.collections.values()) {
      if (Array.isArray(arr)) arr.length = 0;
    }
  }
}

export function createMemoryDb() {
  return new MemoryDb();
}