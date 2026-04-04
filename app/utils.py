from datetime import datetime

def parse_date(date_str):
    """Convert string YYYY-MM-DD to datetime object"""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Invalid date format. Use YYYY-MM-DD.")