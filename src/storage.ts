function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pixel_painter", 1);

    // version change
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("buffers")) {
        db.createObjectStore("buffers");
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export const localDataBase = async () => {
  const db = await openDB();

  async function save(
    name: string,
    buffer: Uint32Array<ArrayBuffer>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("buffers", "readwrite");
      const store = tx.objectStore("buffers");
      store.put(buffer, name);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  }

  async function load(name: string): Promise<Uint32Array<ArrayBuffer>> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("buffers", "readonly");
      const store = tx.objectStore("buffers");
      const request = store.get(name);

      request.onsuccess = (e) =>
        resolve((e.target as IDBRequest).result as Uint32Array<ArrayBuffer>);
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  }

  return {
    save,
    load,
  };
};
