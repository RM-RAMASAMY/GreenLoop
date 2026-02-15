import sys
import json
import traceback

def main():
    try:
        try:
            # Try importing the library (Top-level module is 'cortex')
            from cortex import CortexClient as Client
        except ImportError:
            print(json.dumps({"status": "skipped", "message": "actiancortex library not installed (cortex module missing)"}))
            return

        # Read input from stdin
        input_str = sys.stdin.read()
        if not input_str:
            return

        request = json.loads(input_str)
        command = request.get("command")
        data = request.get("data")
        
        responses = []
        
        # Initialize Client
        # client = CortexClient("localhost:50051")
        # client.connect() OR use context manager

        with Client("localhost:50051") as client:
            collection_name = "greenloop_user_context"
            
            # Ensure collection exists
            if not client.has_collection(collection_name):
                # Gemini embedding dimension is 768
                client.create_collection(collection_name, 768)

            if command == "upsert":
                # data: { id, vector, payload }
                client.upsert(collection_name, data['id'], data['vector'], data['payload'])
                responses = {"status": "success"}
                
            elif command == "search":
                # data: { vector, top_k }
                results = client.search(collection_name, data['vector'], data.get('top_k', 5))
                # Format results
                hits = []
                for res in results:
                    hits.append({
                        "id": res.id,
                        "score": res.score,
                        "payload": res.payload
                    })
                responses = {"status": "success", "hits": hits}

        print(json.dumps(responses))

    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e), "trace": traceback.format_exc()}))

if __name__ == "__main__":
    main()
