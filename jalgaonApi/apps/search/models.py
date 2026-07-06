from django.db import models

class SearchQuery(models.Model):
    """
    Tracks every search query for:
    1. Popular searches feature (FR-SRCH-06)
    2. Analytics / admin insight
    """
    query = models.CharField(max_length=200, db_index=True)
    count = models.PositiveIntegerField(default=1)
    last_searched = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'search_query'
        ordering = ['-count', '-last_searched']

    def __str__(self):
        return f"{self.query} ({self.count})"

    @classmethod
    def record(cls, query: str) -> None:
        """
        Upsert: increment count if exists, create if not.
        Silently fails on any error so it never breaks search.
        """
        if not query or len(query.strip()) < 2:
            return
        try:
            normalized = query.strip().lower()[:200]
            obj, created = cls.objects.get_or_create(query=normalized)
            if not created:
                cls.objects.filter(pk=obj.pk).update(
                    count=models.F('count') + 1,
                    last_searched=models.functions.Now()
                )
        except Exception:
            pass  # Never break search due to analytics failure


class SearchSynonym(models.Model):
    """
    Admin-managed synonym table for FR-SRCH-07.
    Example: term="doctor" → synonyms=["clinic", "hospital", "physician"]
    When a user searches "doctor", the queryset also includes results
    matching "clinic", "hospital", and "physician".
    """
    term = models.CharField(max_length=100, unique=True, db_index=True,
                            help_text="The root word users might type (lowercase)")
    synonyms = models.JSONField(
        default=list,
        help_text='JSON array of synonym strings, e.g. ["clinic", "hospital"]'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'search_synonym'
        ordering = ['term']

    def __str__(self):
        return f"{self.term} → {self.synonyms}"

