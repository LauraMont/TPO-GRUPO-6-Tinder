from __future__ import annotations
from datetime import datetime
import uuid
from typing import Any
from cassandra.cluster import Session

class CassandraSwipeRepository:
    def __init__(self, cassandra_session: Session) -> None:
        self._cassandra = cassandra_session

    def log_swipe(self, user_id: str, target_user_id: str, tipo_interaccion: str) -> None:
        query = """
            INSERT INTO swipes_por_usuario (usuario_id, fecha_interaction, usuario_destino_id, tipo_interaccion)
            VALUES (%s, %s, %s, %s)
        """
        self._cassandra.execute(
            query, 
            (uuid.UUID(user_id), datetime.now(), uuid.UUID(target_user_id), tipo_interaccion)
        )

    def get_history(self, user_id: str) -> list[dict[str, Any]]:
        query = """
            SELECT fecha_interaction, usuario_destino_id, tipo_interaccion 
            FROM swipes_por_usuario 
            WHERE usuario_id = %s
        """
        rows = self._cassandra.execute(query, [uuid.UUID(user_id)])
        return [
            {
                "fecha": row.fecha_interaction.strftime("%Y-%m-%d %H:%M:%S"),
                "usuario_destino_id": str(row.usuario_destino_id),
                "tipo_interaccion": row.tipo_interaccion
            }
            for row in rows
        ]
