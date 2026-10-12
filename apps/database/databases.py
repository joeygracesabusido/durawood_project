from typing import Optional,List
from pydantic import condecimal
from sqlmodel import Field, Session, SQLModel, create_engine,select,func,funcfilter,within_group,Relationship

from datetime import datetime, date


import urllib.parse


import os


class connectionDB:

    def conn():
        
        connection_string = "mysql+pymysql://{user}:{password}@{host}:{port}/{database}".format(
            user=os.getenv("MYSQL_USER", "joeysabusido"),
            password=urllib.parse.quote(os.getenv("MYSQL_PASSWORD", "Genesis@11")),
            host=os.getenv("MYSQL_HOST", "146.190.90.213"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            database=os.getenv("MYSQL_DB", "excel_consultancy")
        )  # shortcut: defaults keep local dev running; set MYSQL_* env in prod and rotate the password


        engine = create_engine(connection_string, echo=True)
        return engine
