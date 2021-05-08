<template>
  <div class="news-entry row my-3">
      <div class="author col-lg-2 mr-1">
          <img class="news-avatar" :src="authorAvatarUrl" :alt="authorName">
          <p :style="{ color: authorColor }">{{authorName}}</p>
      </div>
      <div class="details col-lg-10">
          <p class="title text-truncate mb-1">{{title}}</p>
          <p class="content">{{content}}</p>
      </div>
  </div>
</template>

<script lang="ts">
export default {
    props: {
        authorName: {
            type: String,
            required: true
        },
        authorAvatarUrl: {
            type: String,
            required: true
        },
        authorColor: {
            type: String,
            default: "#e01b1b"
        },
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
.author {
    text-align: center;
    font-weight: 600;
}

.title {
    font-weight: 600;
    font-size: 1rem;
}

.content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

    font-size: 0.9rem;
}

.news-avatar {
    width: 80px;
    border-radius: 40px;
}

</style>